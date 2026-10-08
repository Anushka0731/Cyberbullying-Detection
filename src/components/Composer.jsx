import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import './Composer.css';
import { extractTextFromImage } from '../services/ocrService.js';

const Composer = forwardRef(function Composer(
  { onPost, user },
  ref
) {
  const [text, setText] = useState('');
  const [screenshot, setScreenshot] = useState(null);

  // OCR states
  const [ocrText, setOcrText] = useState('');
  const [ocrStatus, setOcrStatus] = useState('');

  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus() {
      textareaRef.current?.focus();

      textareaRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    },
  }));

  function handleScreenshotClick() {
    fileInputRef.current?.click();
  }

  async function handlePaste(e) {
  const items = e.clipboardData?.items;

  if (!items) return;

  for (const item of items) {
    if (!item.type.startsWith('image/')) {
      continue;
    }

    const file = item.getAsFile();

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);

    // Remove previous screenshot URL
    if (screenshot?.url) {
      URL.revokeObjectURL(screenshot.url);
    }

    setScreenshot({
      file,
      url: imageUrl,
      name: 'Pasted screenshot',
    });

    setOcrText('');
    setOcrStatus('Reading text from screenshot...');

    try {
      const extractedText = await extractTextFromImage(file);

      if (!extractedText) {
        setOcrStatus('No text detected in this image.');
        setOcrText('');
        return;
      }

      setOcrText(extractedText);
      setOcrStatus('Text detected successfully.');
    } catch (error) {
      console.error('OCR error:', error);
      setOcrStatus('Could not read text from this image.');
      setOcrText('');
    }

    return;
  }
}

  async function handleScreenshotChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    // Only allow images
    if (!file.type.startsWith('image/')) {
      alert('Please select an image or screenshot.');
      return;
    }

    const imageUrl = URL.createObjectURL(file);

    setScreenshot({
      file,
      url: imageUrl,
      name: file.name,
    });

    // Reset previous OCR result
    setOcrText('');
    setOcrStatus('Reading text from screenshot...');

    try {
      const extractedText = await extractTextFromImage(file);

      if (!extractedText) {
        setOcrStatus('No text detected in this image.');
        setOcrText('');
        return;
      }

      setOcrText(extractedText);
      setOcrStatus('Text detected successfully.');
    } catch (error) {
      console.error('OCR error:', error);
      setOcrStatus('Could not read text from this image.');
      setOcrText('');
    }
  }

  function removeScreenshot() {
    if (screenshot?.url) {
      URL.revokeObjectURL(screenshot.url);
    }

    setScreenshot(null);
    setOcrText('');
    setOcrStatus('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handlePost() {
    const trimmed = text.trim();

    // If there is normal text, use it.
    if (trimmed) {
      onPost(trimmed);
      setText('');
      return;
    }

    // If there is a screenshot with detected text,
    // send the extracted OCR text for analysis.
    if (screenshot && ocrText) {
      onPost(ocrText);
      return;
    }

    // Screenshot exists but contains no text.
    if (screenshot && !ocrText) {
      return;
    }
  }

  const canPost =
    text.trim() ||
    (screenshot && ocrText);

  return (
  <div
  className="composer"
  onPaste={handlePaste}
>

      <div className="composer-row">

        <div className="post-avatar">
          {user?.initials ?? '..'}
        </div>

        <textarea
          ref={textareaRef}
          placeholder="Share something with the community..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

      </div>

      {/* Screenshot preview */}
      {screenshot && (
        <div className="screenshot-preview">

          <div className="screenshot-preview-header">
            <span>
              Screenshot added
            </span>

            <button
              type="button"
              className="remove-screenshot"
              onClick={removeScreenshot}
              aria-label="Remove screenshot"
            >
              ×
            </button>
          </div>

          <img
            src={screenshot.url}
            alt="Selected screenshot"
          />

          {/* OCR status */}
          {ocrStatus && (
            <div className="ocr-status">
              {ocrStatus}
            </div>
          )}

          {/* Extracted text */}
          {ocrText && (
            <div className="ocr-result">
              <strong>Detected text:</strong>
              <p>{ocrText}</p>
            </div>
          )}

        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleScreenshotChange}
        style={{ display: 'none' }}
      />

      <div className="composer-footer">

        <div className="composer-actions">

          <button
            type="button"
            className="add-screenshot-btn"
            onClick={handleScreenshotClick}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
              />

              <circle
                cx="8.5"
                cy="8.5"
                r="1.5"
              />

              <path d="M21 15l-5-5L5 21" />
            </svg>

            Add Screenshot
          </button>

        </div>

        <button
          className="post-btn"
          disabled={!canPost}
          onClick={handlePost}
        >
          Post
        </button>

      </div>

    </div>
  );
});

export default Composer;