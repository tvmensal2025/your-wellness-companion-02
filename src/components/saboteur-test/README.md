# Saboteur Test - Refactored

## Overview

This directory contains the refactored components extracted from `SaboteurTest.tsx` (originally 1119 lines). The component has been split into step-based components for better organization.

## Structure

```
saboteur-test/
├── QuestionStep.tsx    # Question display and answer selection
├── ResultsStep.tsx     # Results display with scores and recommendations
└── README.md           # This file
```

## Components

### QuestionStep
Displays a single question with answer options and navigation.

**Props:**
- `question`: Question object with text and category
- `currentQuestion`: Current question index
- `totalQuestions`: Total number of questions
- `selectedAnswer`: Currently selected answer (1-5)
- `onAnswerChange`: Callback when answer changes
- `onNext`: Callback to go to next question
- `onPrevious`: Callback to go to previous question
- `canGoNext`: Whether next button should be enabled

**Features:**
- Progress bar showing test completion
- Radio button group for answer selection (1-5 scale)
- Navigation buttons (Previous/Next)
- Question counter

### ResultsStep
Displays test results with saboteur analysis and recommendations.

**Props:**
- `scores`: Object with saboteur scores
- `saboteurTypes`: Object with saboteur type definitions
- `userName`: User's name for personalization
- `onDownloadPDF`: Callback to download PDF report
- `onSendWhatsApp`: Callback to send results via WhatsApp
- `onRestart`: Callback to restart the test
- `isGeneratingPDF`: Loading state for PDF generation
- `isSendingWhatsApp`: Loading state for WhatsApp sending

**Features:**
- Top saboteur highlight with icon and description
- Progress bars for all saboteur scores
- Characteristics list
- Impact warning
- Strategies for overcoming
- Action buttons (Download PDF, Send WhatsApp, Restart)

## Usage

```tsx
import { QuestionStep } from './saboteur-test/QuestionStep';
import { ResultsStep } from './saboteur-test/ResultsStep';

function SaboteurTest() {
  const [showResults, setShowResults] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  if (showResults) {
    return (
      <ResultsStep
        scores={scores}
        saboteurTypes={saboteurTypes}
        userName={userName}
        onDownloadPDF={handleDownloadPDF}
        onSendWhatsApp={handleSendWhatsApp}
        onRestart={handleRestart}
        isGeneratingPDF={isGeneratingPDF}
        isSendingWhatsApp={isSendingWhatsApp}
      />
    );
  }

  return (
    <QuestionStep
      question={questions[currentQuestion]}
      currentQuestion={currentQuestion}
      totalQuestions={questions.length}
      selectedAnswer={answers[currentQuestion]}
      onAnswerChange={(value) => handleAnswerChange(currentQuestion, value)}
      onNext={handleNext}
      onPrevious={handlePrevious}
      canGoNext={!!answers[currentQuestion]}
    />
  );
}
```

## Saboteur Types

The test identifies 9 types of internal saboteurs:
1. **Perfeccionista** - Demands absolute perfection
2. **Procrastinador** - Always finds excuses to delay
3. **Comparador** - Constantly compares with others
4. **Autocrítico** - Has extremely negative self-talk
5. **Medroso** - Fears failure and avoids trying
6. **Binário** - Sees everything as black or white
7. **Vítima** - Always sees self as victim
8. **Controlador** - Needs to control everything
9. **Aprovação** - Seeks constant approval from others

## Benefits

1. **Reduced Complexity**: Each step is in its own component
2. **Reusability**: Steps can be used independently
3. **Testability**: Easier to test individual steps
4. **Maintainability**: Smaller files are easier to understand
5. **User Experience**: Clear separation of test phases

## Requirements Satisfied

- ✅ Requirement 1.12: Extract each step into separate component
- ✅ Component size < 500 lines per file
- ✅ Improved code organization
- ✅ Better separation of concerns

## Note

The original `SaboteurTest.tsx` file remains intact. To use the refactored components, import them from this directory and integrate them into the main component gradually.
