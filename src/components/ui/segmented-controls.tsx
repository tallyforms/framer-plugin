import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion } from 'framer-motion';
import cx from 'classnames';

interface SegmentedControlContextValue<Value> {
  value: Value;
  onChange: (value: Value) => void;
  disabled?: boolean;
  registerItem: (value: Value) => void;
  items: Value[];
}

const SegmentedControlContext = createContext<SegmentedControlContextValue<unknown> | null>(null);

function useSegmentedControl<Value>() {
  const context = useContext(SegmentedControlContext);

  if (!context) {
    throw new Error('SegmentedControl components must be used within SegmentedControl');
  }

  return context as SegmentedControlContextValue<Value>;
}

interface SegmentedControlProps<Value> {
  value?: Value;
  defaultValue?: Value;
  onChange?: (value: Value) => void;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function SegmentedControl<Value>({
  value: controlledValue,
  defaultValue,
  onChange,
  disabled,
  children,
  className,
}: SegmentedControlProps<Value>) {
  const [internalValue, setInternalValue] = useState<Value>(
    controlledValue ?? defaultValue ?? ('' as Value),
  );
  const [items, setItems] = useState<Value[]>([]);

  const value = useMemo(() => controlledValue ?? internalValue, [controlledValue, internalValue]);

  const handleChange = (newValue: Value) => {
    if (disabled) {
      return;
    }

    if (!controlledValue) {
      setInternalValue(newValue);
    }

    onChange?.(newValue);
  };

  const registerItem = (itemValue: Value) => {
    setItems((prev) => {
      if (!prev.includes(itemValue)) {
        return [...prev, itemValue];
      }

      return prev;
    });
  };

  useEffect(() => {
    if (!controlledValue) {
      return;
    }

    setInternalValue(controlledValue);
  }, [controlledValue]);

  return (
    <SegmentedControlContext.Provider
      value={
        {
          value,
          onChange: handleChange,
          disabled,
          registerItem,
          items,
        } as SegmentedControlContextValue<unknown>
      }>
      <div className={cx('grid grid-cols-3 items-center justify-between w-full', className)}>
        {children}
      </div>
    </SegmentedControlContext.Provider>
  );
}

interface SegmentedControlLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function SegmentedControlLabel({ children, className }: SegmentedControlLabelProps) {
  return (
    <label
      className={cx(
        'whitespace-nowrap overflow-hidden text-ellipsis text-foreground pl-4 flex items-center col-span-1',
        className,
      )}>
      {typeof children === 'string' ? capitalizeWords(children) : children}
    </label>
  );
}

interface SegmentedControlItemsProps {
  children: React.ReactNode;
  className?: string;
}

export function SegmentedControlItems({ children, className }: SegmentedControlItemsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { value, items } = useSegmentedControl();

  const indicatorDimensions = useMemo(() => {
    return {
      width: `calc((100% - 2px - 2px) / ${items.length})`,
      height: `calc(100% - 2px - 2px)`,
    };
  }, [items.length]);

  const animateX = useMemo(() => {
    return {
      left: `calc(${items.findIndex((item) => item === value)} * (100% - 2px - 2px) / ${items.length} + 2px)`,
    };
  }, [value, items]);

  return (
    <div
      ref={containerRef}
      className={cx(
        'relative flex col-span-2 justify-center items-center w-full rounded-lg overflow-visible bg-neutral-100 dark:bg-neutral-800 p-0.5 h-8 text-neutral-400',
        className,
      )}>
      {children}
      <motion.div
        className="absolute bg-white dark:bg-neutral-600 rounded-md z-0 shadow-md"
        initial={animateX}
        animate={animateX}
        style={indicatorDimensions}
      />
    </div>
  );
}

function capitalizeWords(value: string) {
  return value.replace(/(\b[a-z](?!\s))/g, (x) => x.toUpperCase());
}

interface SegmentedControlItemProps<Value> {
  value: Value;
  children: React.ReactNode;
  className?: string;
}

export function SegmentedControlItem<Value>({
  value: itemValue,
  children,
  className,
}: SegmentedControlItemProps<Value>) {
  const { value, onChange, disabled, registerItem } = useSegmentedControl<Value>();

  useEffect(() => {
    registerItem(itemValue);
  }, [itemValue, registerItem]);

  const handleClick = useCallback(() => {
    if (disabled) {
      return;
    }

    onChange(itemValue);
  }, [disabled, onChange, itemValue]);

  const isSelected = useMemo(() => value === itemValue, [value, itemValue]);

  return (
    <span
      onClick={handleClick}
      className={cx(
        'relative flex justify-center items-center text-center w-full cursor-pointer rounded-md transition-colors duration-200 z-10',
        'hover:opacity-80',
        {
          'text-accent dark:text-white !font-semibold': isSelected,
        },
        className,
      )}>
      {typeof children === 'string' ? capitalizeWords(children) : children}
    </span>
  );
}
