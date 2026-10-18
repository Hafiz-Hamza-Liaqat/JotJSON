import { useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import type { WorkspaceId } from '../components/WorkspaceTabs';
import { StickerBook } from '../features/achievements/StickerBook';
import { StickerModal } from '../features/achievements/StickerModal';
import { SyntaxDetective } from '../features/challenges/SyntaxDetective';
import { CompareWorkspace } from '../features/compare/CompareWorkspace';
import { FormatWorkspace } from '../features/format/FormatWorkspace';
import { LearningHome } from '../features/learning/LearningHome';
import { LESSON_1_JSON_BASICS } from '../features/learning/lessonData';
import type { LearnViewMode, PrimaryNavMode } from '../features/learning/learningTypes';
import { LessonView } from '../features/learning/LessonView';
import { useLearningProgress } from '../features/progress/useLearningProgress';
import { SearchWorkspace } from '../features/search/SearchWorkspace';
import { useTheme } from '../hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  // Primary mode: 'playground' (v1.0 developer workspace) vs 'learn' (v2.0 JotJSON PlayLab)
  const [primaryMode, setPrimaryMode] = useState<PrimaryNavMode>('playground');

  // Playground workspace state (preserved)
  const [workspace, setWorkspace] = useState<WorkspaceId>('format');
  const [formatInput, setFormatInput] = useState('');
  const [compareOriginal, setCompareOriginal] = useState('');
  const [compareModified, setCompareModified] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Learn & Play view state
  const [learnView, setLearnView] = useState<LearnViewMode>('home');

  // Learning progress hook
  const {
    progress,
    completeStep,
    completeLesson,
    completeChallenge,
    recordHintUsed,
    resetAllProgress,
    newlyUnlockedSticker,
    dismissStickerModal,
    floatingXp,
    dismissFloatingXp,
  } = useLearningProgress();

  return (
    <div className="flex min-h-dvh flex-col bg-slate-50 text-slate-900 dark:bg-[#0B1220] dark:text-slate-100">
      <AppHeader
        primaryMode={primaryMode}
        onPrimaryModeChange={setPrimaryMode}
        workspace={workspace}
        onWorkspaceChange={setWorkspace}
        learnView={learnView}
        onLearnViewChange={setLearnView}
        totalXp={progress.totalXp}
        floatingXp={floatingXp}
        onDismissFloatingXp={dismissFloatingXp}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="mx-auto flex w-full max-w-[1440px] min-h-0 flex-1 flex-col px-4 py-4">
        {/* Playground Workspaces */}
        {primaryMode === 'playground' ? (
          <>
            {workspace === 'format' ? (
              <FormatWorkspace theme={theme} input={formatInput} onInputChange={setFormatInput} />
            ) : null}
            {workspace === 'compare' ? (
              <CompareWorkspace
                theme={theme}
                original={compareOriginal}
                modified={compareModified}
                onOriginalChange={setCompareOriginal}
                onModifiedChange={setCompareModified}
              />
            ) : null}
            {workspace === 'search' ? (
              <SearchWorkspace theme={theme} input={searchInput} onInputChange={setSearchInput} />
            ) : null}
          </>
        ) : (
          /* Learn & Play Views */
          <>
            {learnView === 'home' && (
              <LearningHome
                progress={progress}
                onStartLesson={() => setLearnView('lesson')}
                onStartDetective={() => setLearnView('detective')}
                onOpenStickerBook={() => setLearnView('stickers')}
                onResetProgress={resetAllProgress}
              />
            )}

            {learnView === 'lesson' && (
              <LessonView
                lesson={LESSON_1_JSON_BASICS}
                progress={progress}
                onCompleteStep={completeStep}
                onCompleteLesson={completeLesson}
                onBackToHome={() => setLearnView('home')}
                theme={theme}
              />
            )}

            {learnView === 'detective' && (
              <SyntaxDetective
                progress={progress}
                onCompleteChallenge={completeChallenge}
                onRecordHint={recordHintUsed}
                onBackToHome={() => setLearnView('home')}
                theme={theme}
              />
            )}

            {learnView === 'stickers' && (
              <StickerBook progress={progress} onBackToHome={() => setLearnView('home')} />
            )}
          </>
        )}
      </main>

      {/* Achievement Unlock Modal */}
      {newlyUnlockedSticker && (
        <StickerModal stickerId={newlyUnlockedSticker} onClose={dismissStickerModal} />
      )}

      <footer className="border-t border-slate-200 px-4 py-3 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        JSON is processed in this browser. Documents are not uploaded. Learning progress and theme preferences are saved locally.
      </footer>
    </div>
  );
}
