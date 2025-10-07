import './globals.css';

import { framer } from 'framer-plugin';
import { useCallback, useState } from 'react';
import { FramerPlugin } from '@triozer/framer-toolbox';
import {
  SegmentedControl,
  SegmentedControlLabel,
  SegmentedControlItems,
  SegmentedControlItem,
} from '@/components/ui/segmented-controls';

enum Config {
  ComponentUrl = 'https://framer.com/m/TallyForms-JClE.js',
  BaseUrl = 'https://tally.so',
}

export default function App() {
  const [formUrl, setFormUrl] = useState('');
  const [showTitle, setShowTitle] = useState(false);
  const [alignLeft, setAlignLeft] = useState(true);
  const [showBackground, setShowBackground] = useState(false);

  const handleAddTally = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (!framer.isAllowedTo('addComponentInstance')) {
        return;
      }

      await framer.addComponentInstance({
        url: Config.ComponentUrl,
        attributes: {
          controls: {
            form: formUrl,
            title: showTitle,
            alignLeft: alignLeft,
            background: showBackground,
          },
        },
      });
    },
    [formUrl, showTitle, alignLeft, showBackground],
  );

  return (
    <FramerPlugin
      autoResize={true}
      uiOptions={{
        resizable: true,
      }}>
      <div className="flex flex-col gap-2 w-full">
        <div className="flex flex-col gap-1">
          <label htmlFor="form-url" className="!text-foreground">
            Form
          </label>
          <input
            className="!w-full"
            id="form-url"
            type="text"
            placeholder="Enter your URL here"
            value={formUrl}
            onChange={(e) => setFormUrl(e.target.value)}
          />
        </div>

        <p className="!text-xs !text-neutral-400">
          Create a form in{' '}
          <a
            href={Config.BaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="!text-accent hover:opacity-80">
            Tally
          </a>{' '}
          and copy the published form link
        </p>
      </div>

      <SegmentedControl value={showTitle} onChange={setShowTitle}>
        <SegmentedControlLabel>Title</SegmentedControlLabel>
        <SegmentedControlItems>
          <SegmentedControlItem value={true}>Show</SegmentedControlItem>
          <SegmentedControlItem value={false}>Hide</SegmentedControlItem>
        </SegmentedControlItems>
      </SegmentedControl>

      <SegmentedControl value={alignLeft} onChange={setAlignLeft}>
        <SegmentedControlLabel>Align</SegmentedControlLabel>
        <SegmentedControlItems>
          <SegmentedControlItem value={true}>Left</SegmentedControlItem>
          <SegmentedControlItem value={false}>Center</SegmentedControlItem>
        </SegmentedControlItems>
      </SegmentedControl>

      <SegmentedControl value={showBackground} onChange={setShowBackground}>
        <SegmentedControlLabel>Background</SegmentedControlLabel>
        <SegmentedControlItems>
          <SegmentedControlItem value={true}>Show</SegmentedControlItem>
          <SegmentedControlItem value={false}>Hide</SegmentedControlItem>
        </SegmentedControlItems>
      </SegmentedControl>

      <button
        className="!bg-accent !text-accent-foreground hover:opacity-80"
        onClick={handleAddTally}
        disabled={!formUrl}>
        Embed form
      </button>
    </FramerPlugin>
  );
}
