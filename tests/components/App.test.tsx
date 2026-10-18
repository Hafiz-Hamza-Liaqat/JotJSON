import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/app/App';
import { MAX_INPUT_BYTES } from '../../src/lib/json/limits';

vi.mock('../../src/components/JsonEditor', () => ({
  JsonEditor: ({
    id,
    label,
    value,
    onChange,
    readOnly,
  }: {
    id: string;
    label: string;
    value: string;
    onChange?: (value: string) => void;
    readOnly?: boolean;
  }) => (
    <label>
      {label}
      <textarea
        id={id}
        aria-label={label}
        readOnly={readOnly}
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
      />
    </label>
  ),
}));

describe('JotJSON app', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = 'dark';
  });

  it('switches workspaces', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole('tab', { name: 'Format & Validate' })).toHaveAttribute('aria-selected', 'true');
    await user.click(screen.getByRole('tab', { name: 'Compare JSON' }));
    expect(screen.getByRole('tab', { name: 'Compare JSON' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: /compare/i })).toBeInTheDocument();
    await user.click(screen.getByRole('tab', { name: 'Search JSON' }));
    expect(screen.getByLabelText('Query')).toBeInTheDocument();
  });

  it('toggles theme and persists the preference', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'Switch to light theme' }));
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('jotjson-theme')).toBe('light');
  });

  it('formats editor input and copies output', async () => {
    const user = userEvent.setup();
    const writeSpy = vi.spyOn(navigator.clipboard, 'writeText');
    render(<App />);
    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '{"a":1}' } });
    await user.click(screen.getByRole('button', { name: 'Format' }));
    const output = screen.getByLabelText('Output') as HTMLTextAreaElement;
    expect(output.value).toContain('"a": 1');
    await user.click(screen.getByRole('button', { name: 'Copy output' }));
    await waitFor(() => expect(writeSpy).toHaveBeenCalled());
  });

  it('shows validation errors', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '{' } });
    await user.click(screen.getByRole('button', { name: 'Validate' }));
    expect(screen.getByRole('alert').textContent).toMatch(/line/i);
  });

  it('marks format output as stale after input changes', async () => {
    const user = userEvent.setup();
    render(<App />);
    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '{"a":1}' } });
    await user.click(screen.getByRole('button', { name: 'Format' }));
    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '{"a":1} ' } });
    expect(screen.getByText(/input changed after this output/i)).toBeInTheDocument();
  });

  it('compares documents and lists a difference', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: 'Compare JSON' }));
    fireEvent.change(screen.getByLabelText('Original'), {
      target: { value: '{"user":{"name":"Alex"}}' },
    });
    fireEvent.change(screen.getByLabelText('Modified'), {
      target: { value: '{"user":{"name":"Alexandra"}}' },
    });
    await user.click(screen.getByRole('button', { name: 'Compare' }));
    expect(screen.getByText('$["user"]["name"]')).toBeInTheDocument();
  });

  it('searches nested JSON', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('tab', { name: 'Search JSON' }));
    fireEvent.change(screen.getByLabelText('JSON document'), {
      target: { value: '{"user":{"email":"casey@example.test"}}' },
    });
    await user.type(screen.getByLabelText('Query'), 'email');
    await user.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByText('$["user"]["email"]')).toBeInTheDocument();
  });

  it('reports copy failure honestly', async () => {
    const user = userEvent.setup();
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('denied'));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Input'), { target: { value: '{"a":1}' } });
    await user.click(screen.getByRole('button', { name: 'Format' }));
    await user.click(screen.getByRole('button', { name: 'Copy output' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/copy failed|denied|clipboard/i);
  });

  it('rejects oversized files before reading', async () => {
    const user = userEvent.setup();
    render(<App />);
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['ignored'], 'huge.json', { type: 'application/json' });
    Object.defineProperty(file, 'size', { value: MAX_INPUT_BYTES + 1 });
    await user.upload(input, file);
    expect(screen.getByRole('alert').textContent).toMatch(/exceeds/i);
  });
});
