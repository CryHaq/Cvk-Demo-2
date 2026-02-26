import { useState, type ReactNode } from 'react';
import { Check, ChevronRight, ChevronLeft, Package, Ruler, Layers, Palette, Calculator, Truck } from 'lucide-react';

interface Step {
  id: string;
  label: string;
  icon: React.ElementType;
  description: string;
}

interface ConfiguratorWizardProps {
  children: ReactNode[];
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  canProceed: boolean;
}

export const configuratorSteps: Step[] = [
  { id: 'product', label: 'Ürün', icon: Package, description: 'Ürün tipi seçimi' },
  { id: 'size', label: 'Boyut', icon: Ruler, description: 'Ölçüleri belirleyin' },
  { id: 'material', label: 'Malzeme', icon: Layers, description: 'Malzeme seçimi' },
  { id: 'features', label: 'Özellikler', icon: Palette, description: 'Ek özellikler' },
  { id: 'quantity', label: 'Miktar', icon: Calculator, description: 'Adet ve grafik' },
  { id: 'delivery', label: 'Teslimat', icon: Truck, description: 'Süre ve özet' },
];

export default function ConfiguratorWizard({
  children,
  steps,
  currentStep,
  onStepChange,
  onComplete,
  canProceed,
}: ConfiguratorWizardProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      onStepChange(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      onStepChange(currentStep - 1);
    }
  };

  const handleStepClick = (index: number) => {
    // Sadece tamamlanmış adımlara veya mevcut adıma gitmeye izin ver
    if (index <= Math.max(...completedSteps, currentStep)) {
      onStepChange(index);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Adım {currentStep + 1} / {steps.length}
          </span>
          <span className="text-sm font-medium text-[#0077be]">
            {Math.round(progress)}% Tamamlandı
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#0077be] to-[#00a8e8] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Step Navigation - Desktop */}
      <div className="hidden lg:flex items-center justify-between mb-8 relative">
        {/* Connection Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
        <div 
          className="absolute top-5 left-0 h-0.5 bg-[#0077be] -z-10 transition-all duration-500"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(index) || index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = index <= Math.max(...completedSteps, currentStep);

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(index)}
              disabled={!isClickable && index > currentStep}
              className={`flex flex-col items-center gap-2 transition-all ${
                isClickable || index <= currentStep ? 'cursor-pointer' : 'cursor-not-allowed'
              }`}
            >
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-[#0077be] border-[#0077be] text-white scale-110 shadow-lg shadow-[#0077be]/30'
                    : isCompleted
                    ? 'bg-[#0077be] border-[#0077be] text-white'
                    : 'bg-white dark:bg-[#1e293b] border-gray-300 dark:border-gray-600 text-gray-400'
                }`}
              >
                {isCompleted && !isCurrent ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <step.icon className="w-5 h-5" />
                )}
              </div>
              <div className="text-center">
                <p className={`text-sm font-medium ${isCurrent ? 'text-[#0077be]' : isCompleted ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>
                  {step.label}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">{step.description}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Navigation - Mobile */}
      <div className="lg:hidden mb-6">
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
          {(() => {
            const StepIcon = steps[currentStep].icon;
            return (
              <>
                <div className="w-12 h-12 bg-[#0077be] rounded-xl flex items-center justify-center text-white">
                  <StepIcon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{steps[currentStep].label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{steps[currentStep].description}</p>
                </div>
                <span className="text-sm text-gray-400 dark:text-gray-500">
                  {currentStep + 1}/{steps.length}
                </span>
              </>
            );
          })()}
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {children[currentStep]}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
            currentStep === 0
              ? 'text-gray-300 cursor-not-allowed'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          Geri
        </button>

        <div className="flex items-center gap-4">
          {currentStep > 0 && (
              <span className="hidden sm:block text-sm text-gray-500 dark:text-gray-400">
                {completedSteps.length} adım tamamlandı
              </span>
          )}
          
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all ${
              canProceed
                ? 'bg-[#0077be] text-white hover:bg-[#005a8f] shadow-lg shadow-[#0077be]/30'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {currentStep === steps.length - 1 ? (
              <>Teklifi Gör <Check className="w-5 h-5" /></>
            ) : (
              <>Devam Et <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// Adım tamamlama indicator'ı
export function StepIndicator({ 
  isComplete, 
  isActive 
}: { 
  isComplete: boolean; 
  isActive: boolean;
}) {
  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
      isComplete ? 'bg-green-500 text-white' : 
      isActive ? 'bg-[#0077be] text-white' : 
      'bg-gray-200 text-gray-400'
    }`}>
      {isComplete ? (
        <Check className="w-4 h-4" />
      ) : (
        <span className="text-xs">{isActive ? '●' : '○'}</span>
      )}
    </div>
  );
}
