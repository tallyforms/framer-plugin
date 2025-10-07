import { useCallback, useEffect, useMemo, useRef } from 'react';
import { addPropertyControls, ControlType } from 'framer';

const WIDGET_URL = 'https://tally.so/widgets/embed.js';

interface TallyFormsProps {
  form: string;
  title: boolean;
  alignLeft: boolean;
  background: boolean;
}

/**
 * @framerIntrinsicWidth 700
 * @framerSupportedLayoutWidth fixed
 * @framerSupportedLayoutHeight any
 */
export default function TallyForms(props: TallyFormsProps) {
  const { form, title, alignLeft, background } = props;
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const embedUrl = useMemo(() => {
    const searchParams = new URLSearchParams({
      hideTitle: title ? '0' : '1',
      alignLeft: alignLeft ? '1' : '0',
      transparentBackground: background ? '0' : '1',
      dynamicHeight: '1',
    });

    let url = '';
    if (form.includes('tally.so/')) {
      // Tally link with form ID
      const matches = form.match(/\/(?:r|embed|popup|forms)\/([a-zA-Z0-9]+)/);
      if (matches !== null) {
        const formId = matches[1];
        url = `https://tally.so/embed/${formId}`;
      }
    } else if (form.startsWith('http') && form.includes('.')) {
      // Custom domain
      url = form;
      searchParams.set('embed', '1');
    }

    // If we still don't have URL, we assume the form is the form ID itself
    if (!url) {
      url = `https://tally.so/embed/${form}`;
    }

    // Append query params
    return `${url}?${searchParams.toString()}`;
  }, [form, title, alignLeft, background]);

  const loadEmbeds = useCallback(() => {
    // Remove initialized attribute if any, so we can reload
    const iframeEl = iframeRef.current;
    if (iframeEl?.dataset?.tallyEmbedWidgetInitialized) {
      iframeEl.removeAttribute('data-tally-embed-widget-initialized');
    }

    // @ts-expect-error Tally is not defined in the global scope
    if (typeof Tally !== 'undefined') {
      // @ts-expect-error Tally is not defined in the global scope
      Tally.loadEmbeds();
    } else {
      document.querySelectorAll('iframe[data-tally-src]:not([src])').forEach((e) => {
        (e as HTMLIFrameElement).src = (e as HTMLIFrameElement).dataset.tallySrc!;
      });
    }
  }, []);

  const loadWidgetScript = useCallback(() => {
    const scriptEl = document.createElement('script');
    scriptEl.src = WIDGET_URL;
    scriptEl.onload = loadEmbeds;
    scriptEl.onerror = loadEmbeds;
    document.body.appendChild(scriptEl);
  }, [loadEmbeds]);

  useEffect(() => {
    const iframeEl = iframeRef.current;
    if (!iframeEl) {
      return;
    }

    // @ts-expect-error Tally is not defined in the global scope
    if (typeof Tally !== 'undefined') {
      /**
       * Reset iframe to uninitialized state so Tally's widget can reinitialize it properly.
       * This ensures dynamic height and all other Tally features work correctly.
       */
      if (iframeEl.dataset.tallyEmbedWidgetInitialized) {
        iframeEl.removeAttribute('data-tally-embed-widget-initialized');
        iframeEl.removeAttribute('src');
        iframeEl.style.height = '';

        // Force a reflow before calling loadEmbeds to ensure DOM updates are applied
        void iframeEl.offsetHeight;
      }

      // Use setTimeout to ensure the DOM has updated before Tally processes it
      setTimeout(() => {
        // @ts-expect-error Tally is not defined in the global scope
        if (typeof Tally !== 'undefined') {
          // @ts-expect-error Tally is not defined in the global scope
          Tally.loadEmbeds();
        }
      }, 0);
    } else if (document.querySelector(`script[src="${WIDGET_URL}"]`) == null) {
      loadWidgetScript();
    }
  }, [embedUrl, loadWidgetScript]);

  return (
    <iframe
      ref={iframeRef}
      title="Tally form"
      data-tally-src={embedUrl}
      width="100%"
      height="100%"
      frameBorder={0}
      marginHeight={0}
      marginWidth={0}
    />
  );
}

addPropertyControls(TallyForms, {
  form: {
    type: ControlType.String,
    title: 'Form',
    defaultValue: 'tally.so/r/3EKXW4',
    description: 'Create a form in [Tally](https://tally.so?ref=framer) and copy the form link',
  },
  title: {
    type: ControlType.Boolean,
    title: 'Title',
    enabledTitle: 'Show',
    disabledTitle: 'Hide',
    defaultValue: false,
  },
  alignLeft: {
    type: ControlType.Boolean,
    title: 'Align',
    enabledTitle: 'Left',
    disabledTitle: 'Center',
    defaultValue: true,
  },
  background: {
    type: ControlType.Boolean,
    title: 'Background',
    enabledTitle: 'Show',
    disabledTitle: 'Hide',
    defaultValue: false,
  },
});
