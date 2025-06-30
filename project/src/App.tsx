import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, Delete } from 'lucide-react';

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForNewValue: boolean;
  lastOperation: string | null;
  lastOperand: number | null;
}

function App() {
  const [state, setState] = useState<CalculatorState>({
    display: '0',
    previousValue: null,
    operation: null,
    waitingForNewValue: false,
    lastOperation: null,
    lastOperand: null,
  });

  const formatDisplay = (value: string): string => {
    if (value === 'Error') return value;
    
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    
    // Handle very large numbers
    if (Math.abs(num) > 999999999999) {
      return num.toExponential(6);
    }
    
    // Format with commas for large numbers
    if (Math.abs(num) >= 1000) {
      return num.toLocaleString('en-US', { maximumFractionDigits: 8 });
    }
    
    return value;
  };

  const inputNumber = useCallback((num: string) => {
    setState(prevState => {
      if (prevState.waitingForNewValue) {
        return {
          ...prevState,
          display: num,
          waitingForNewValue: false,
        };
      }
      
      if (prevState.display === '0' || prevState.display === 'Error') {
        return {
          ...prevState,
          display: num,
        };
      }
      
      return {
        ...prevState,
        display: prevState.display + num,
      };
    });
  }, []);

  const inputDecimal = useCallback(() => {
    setState(prevState => {
      if (prevState.waitingForNewValue) {
        return {
          ...prevState,
          display: '0.',
          waitingForNewValue: false,
        };
      }
      
      if (prevState.display.indexOf('.') === -1) {
        return {
          ...prevState,
          display: prevState.display + '.',
        };
      }
      
      return prevState;
    });
  }, []);

  const clear = useCallback(() => {
    setState({
      display: '0',
      previousValue: null,
      operation: null,
      waitingForNewValue: false,
      lastOperation: null,
      lastOperand: null,
    });
  }, []);

  const performOperation = useCallback((nextOperation: string) => {
    setState(prevState => {
      const inputValue = parseFloat(prevState.display);
      
      if (prevState.previousValue === null) {
        return {
          ...prevState,
          previousValue: inputValue,
          operation: nextOperation,
          waitingForNewValue: true,
        };
      }
      
      if (prevState.operation && prevState.waitingForNewValue) {
        return {
          ...prevState,
          operation: nextOperation,
        };
      }
      
      const currentValue = prevState.previousValue || 0;
      let result: number;
      
      switch (prevState.operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          if (inputValue === 0) {
            return {
              ...prevState,
              display: 'Error',
              previousValue: null,
              operation: null,
              waitingForNewValue: true,
            };
          }
          result = currentValue / inputValue;
          break;
        default:
          return prevState;
      }
      
      return {
        ...prevState,
        display: result.toString(),
        previousValue: result,
        operation: nextOperation,
        waitingForNewValue: true,
        lastOperation: prevState.operation,
        lastOperand: inputValue,
      };
    });
  }, []);

  const calculate = useCallback(() => {
    setState(prevState => {
      const inputValue = parseFloat(prevState.display);
      
      if (prevState.previousValue === null || prevState.operation === null) {
        // If no operation is pending, repeat the last operation
        if (prevState.lastOperation && prevState.lastOperand !== null) {
          const currentValue = inputValue;
          let result: number;
          
          switch (prevState.lastOperation) {
            case '+':
              result = currentValue + prevState.lastOperand;
              break;
            case '-':
              result = currentValue - prevState.lastOperand;
              break;
            case '×':
              result = currentValue * prevState.lastOperand;
              break;
            case '÷':
              if (prevState.lastOperand === 0) {
                return {
                  ...prevState,
                  display: 'Error',
                  waitingForNewValue: true,
                };
              }
              result = currentValue / prevState.lastOperand;
              break;
            default:
              return prevState;
          }
          
          return {
            ...prevState,
            display: result.toString(),
            waitingForNewValue: true,
          };
        }
        return prevState;
      }
      
      const currentValue = prevState.previousValue;
      let result: number;
      
      switch (prevState.operation) {
        case '+':
          result = currentValue + inputValue;
          break;
        case '-':
          result = currentValue - inputValue;
          break;
        case '×':
          result = currentValue * inputValue;
          break;
        case '÷':
          if (inputValue === 0) {
            return {
              ...prevState,
              display: 'Error',
              previousValue: null,
              operation: null,
              waitingForNewValue: true,
            };
          }
          result = currentValue / inputValue;
          break;
        default:
          return prevState;
      }
      
      return {
        ...prevState,
        display: result.toString(),
        previousValue: null,
        operation: null,
        waitingForNewValue: true,
        lastOperation: prevState.operation,
        lastOperand: inputValue,
      };
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      event.preventDefault();
      
      if (event.key >= '0' && event.key <= '9') {
        inputNumber(event.key);
      } else if (event.key === '.') {
        inputDecimal();
      } else if (event.key === '+') {
        performOperation('+');
      } else if (event.key === '-') {
        performOperation('-');
      } else if (event.key === '*') {
        performOperation('×');
      } else if (event.key === '/') {
        performOperation('÷');
      } else if (event.key === 'Enter' || event.key === '=') {
        calculate();
      } else if (event.key === 'Escape' || event.key === 'c' || event.key === 'C') {
        clear();
      } else if (event.key === 'Backspace') {
        setState(prevState => {
          if (prevState.display.length > 1 && prevState.display !== 'Error') {
            return {
              ...prevState,
              display: prevState.display.slice(0, -1),
            };
          }
          return {
            ...prevState,
            display: '0',
          };
        });
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [inputNumber, inputDecimal, performOperation, calculate, clear]);

  const Button = ({ 
    onClick, 
    className = '', 
    children, 
    variant = 'default' 
  }: { 
    onClick: () => void; 
    className?: string; 
    children: React.ReactNode;
    variant?: 'default' | 'operation' | 'equals' | 'clear';
  }) => {
    const baseClasses = "h-16 rounded-xl font-semibold text-lg transition-all duration-200 transform active:scale-95 shadow-lg hover:shadow-xl";
    
    const variantClasses = {
      default: "bg-slate-700 hover:bg-slate-600 text-white border border-slate-600 hover:border-slate-500",
      operation: "bg-orange-500 hover:bg-orange-400 text-white border border-orange-400 hover:border-orange-300",
      equals: "bg-blue-600 hover:bg-blue-500 text-white border border-blue-500 hover:border-blue-400",
      clear: "bg-red-500 hover:bg-red-400 text-white border border-red-400 hover:border-red-300"
    };
    
    return (
      <button
        onClick={onClick}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {children}
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <Calculator className="w-8 h-8 text-blue-400 mr-3" />
          <h1 className="text-2xl font-bold text-white">Calculator</h1>
        </div>
        
        {/* Calculator Body */}
        <div className="bg-slate-800 p-6 rounded-2xl shadow-2xl border border-slate-700">
          {/* Display */}
          <div className="bg-slate-900 p-6 rounded-xl mb-6 border border-slate-600">
            <div className="text-right">
              <div className="text-3xl font-mono text-white break-all">
                {formatDisplay(state.display)}
              </div>
              {state.operation && state.previousValue !== null && (
                <div className="text-sm text-slate-400 mt-1">
                  {formatDisplay(state.previousValue.toString())} {state.operation}
                </div>
              )}
            </div>
          </div>
          
          {/* Buttons Grid */}
          <div className="grid grid-cols-4 gap-3">
            {/* Row 1 */}
            <Button onClick={clear} variant="clear" className="col-span-2">
              AC
            </Button>
            <Button onClick={() => setState(prev => ({ ...prev, display: prev.display.slice(0, -1) || '0' }))}>
              <Delete className="w-5 h-5" />
            </Button>
            <Button onClick={() => performOperation('÷')} variant="operation">
              ÷
            </Button>
            
            {/* Row 2 */}
            <Button onClick={() => inputNumber('7')}>7</Button>
            <Button onClick={() => inputNumber('8')}>8</Button>
            <Button onClick={() => inputNumber('9')}>9</Button>
            <Button onClick={() => performOperation('×')} variant="operation">
              ×
            </Button>
            
            {/* Row 3 */}
            <Button onClick={() => inputNumber('4')}>4</Button>
            <Button onClick={() => inputNumber('5')}>5</Button>
            <Button onClick={() => inputNumber('6')}>6</Button>
            <Button onClick={() => performOperation('-')} variant="operation">
              −
            </Button>
            
            {/* Row 4 */}
            <Button onClick={() => inputNumber('1')}>1</Button>
            <Button onClick={() => inputNumber('2')}>2</Button>
            <Button onClick={() => inputNumber('3')}>3</Button>
            <Button onClick={() => performOperation('+')} variant="operation">
              +
            </Button>
            
            {/* Row 5 */}
            <Button onClick={() => inputNumber('0')} className="col-span-2">
              0
            </Button>
            <Button onClick={inputDecimal}>.</Button>
            <Button onClick={calculate} variant="equals">
              =
            </Button>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-slate-400 text-sm">
          Press keys or click buttons • ESC to clear
        </div>
      </div>
    </div>
  );
}

export default App;