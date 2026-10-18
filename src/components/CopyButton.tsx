import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { copyText } from '../lib/browser/clipboard';

type CopyButtonProps = {
  text: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
  onStatus?: (message: string, ok: boolean) => void;
};

export function CopyButton({
  text,
  label,
  disabled = false,
  disabledReason,
  onStatus,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const result = await copyText(text);
    if (result.ok) {
      setCopied(true);
      onStatus?.(`${label} copied.`, true);
      window.setTimeout(() => setCopied(false), 1600);
      return;
    }
    onStatus?.(result.message, false);
  }

  return (
    <button
      type="button"
      className="btn-secondary"
      onClick={() => void handleCopy()}
      disabled={disabled}
      title={disabled ? disabledReason : undefined}
      aria-label={label}
    >
      {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
      {copied ? 'Copied' : label}
    </button>
  );
}
