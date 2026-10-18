import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../../src/app/App';
import { STORAGE_KEY_V2 } from '../../src/features/progress/progressStorage';

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

describe('JotJSON Learn & Play', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('switches between Playground and Learn & Play modes', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Default is Playground with Format & Validate
    expect(screen.getByRole('tab', { name: 'Format & Validate' })).toBeInTheDocument();

    // Click Learn & Play primary navigation tab
    const learnTab = screen.getByRole('tab', { name: /Learn & Play/i });
    await user.click(learnTab);

    // Verify Learn & Play header navigation and dashboard appear
    expect(screen.getByRole('tab', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Lesson 1' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Syntax Detective' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Stickers' })).toBeInTheDocument();
    expect(screen.getAllByText(/JotJSON PlayLab/i)[0]).toBeInTheDocument();

    // Switch back to Playground
    await user.click(screen.getByRole('tab', { name: 'Playground' }));
    expect(screen.getByRole('tab', { name: 'Format & Validate' })).toBeInTheDocument();
  });

  it('displays the first-time welcome and starts Lesson 1', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /Learn & Play/i }));
    expect(screen.getByText(/Welcome to JotJSON PlayLab/i)).toBeInTheDocument();

    // Click Start Lesson 1
    const startButton = screen.getByRole('button', { name: /Start Lesson 1/i });
    await user.click(startButton);

    // Verify Lesson 1 Step 1 view
    expect(screen.getAllByText(/Step 1 of 6/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'What is JSON?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Need a Hint/i })).toBeInTheDocument();
  });

  it('handles incorrect and correct answers with interactive feedback in lessons', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /Learn & Play/i }));
    await user.click(screen.getByRole('button', { name: /Start Lesson 1/i }));

    // Click wrong answer
    const wrongOption = screen.getByRole('radio', { name: /proprietary compiled programming language/i });
    await user.click(wrongOption);
    expect(screen.getByText(/Try again!/i)).toBeInTheDocument();

    // Click Need a Hint
    await user.click(screen.getByRole('button', { name: /Need a Hint/i }));
    expect(screen.getByText(/Byte’s Hint:/i)).toBeInTheDocument();

    // Click correct answer
    const correctOption = screen.getByRole('radio', { name: /lightweight, text-based data format/i });
    await user.click(correctOption);
    expect(screen.getByText(/Exactly right!/i)).toBeInTheDocument();

    // Next step button should now be enabled
    const nextButton = screen.getByRole('button', { name: /Next Step/i });
    expect(nextButton).not.toBeDisabled();
    await user.click(nextButton);

    // Verify advanced to Step 2
    expect(screen.getAllByText(/Step 2 of 6/i)[0]).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Objects and Key\/Value Pairs/i })).toBeInTheDocument();
  });

  it('navigates to Syntax Detective and reveals hints', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /Learn & Play/i }));
    await user.click(screen.getByRole('tab', { name: 'Syntax Detective' }));

    expect(screen.getByRole('heading', { name: /Case Briefing: The Unquoted String/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Check My JSON/i })).toBeInTheDocument();

    // Reveal hint
    const hintButton = screen.getByRole('button', { name: /Get Hint/i });
    await user.click(hintButton);
    expect(screen.getByText(/Clue 1:/i)).toBeInTheDocument();
  });

  it('displays the Sticker Book with locked achievements', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /Learn & Play/i }));
    await user.click(screen.getByRole('tab', { name: 'Stickers' }));

    expect(screen.getByText(/Sticker Book & Achievements/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'JSON Beginner' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Bug Hunter' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Structure Explorer' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Perfect Syntax' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'JSON Champion' })).toBeInTheDocument();
  });

  it('resets learning progress safely when confirmed', async () => {
    // Seed initial progress
    localStorage.setItem(
      STORAGE_KEY_V2,
      JSON.stringify({
        version: 2,
        completedLessonIds: ['lesson-1'],
        completedStepIds: { 'lesson-1': ['step-1'] },
        currentLessonId: 'lesson-1',
        currentStepIndex: 1,
        completedChallengeIds: [],
        currentChallengeIndex: 0,
        hintsUsedByChallenge: {},
        earnedXpEvents: ['lesson-lesson-1'],
        totalXp: 100,
        unlockedStickerIds: ['json-beginner'],
        lastActiveTimestamp: Date.now(),
      }),
    );

    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('tab', { name: /Learn & Play/i }));
    expect(screen.getAllByText(/100 XP/i)[0]).toBeInTheDocument();

    // Click Reset Learning Progress
    const resetTrigger = screen.getByRole('button', { name: /Reset Learning Progress/i });
    await user.click(resetTrigger);

    // Confirmation appears
    expect(screen.getByText(/Reset all learning progress\?/i)).toBeInTheDocument();
    const confirmButton = screen.getByRole('button', { name: /Yes, Reset/i });
    await user.click(confirmButton);

    // XP resets to 0
    expect(screen.getAllByText(/0 XP/i)[0]).toBeInTheDocument();
  });
});
