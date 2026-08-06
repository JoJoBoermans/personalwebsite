import { useState } from 'react';
import type { EditorSnapshot } from '../../lib/editor';
import { copyText, downloadLayoutPng, downloadLayoutSvg, downloadProjectFile, measurementListText } from '../../lib/io';
import type { LayoutMode, ShelfSketchProject } from '../../types/domain';
import { trackEvent } from '../../lib/analytics';

interface Props {
  project: ShelfSketchProject;
  snapshot: EditorSnapshot;
  mode: LayoutMode;
  placedCount: number;
  requestedCount: number;
  utilizationPercent: number;
  unplacedLabels: string[];
  saveStatus: 'idle' | 'saved' | 'failed';
  onSaveSession: () => void;
}

export default function LayoutExportPanel({ project, snapshot, mode, placedCount, requestedCount, utilizationPercent, unplacedLabels, saveStatus, onSaveSession }: Props) {
  const [status, setStatus] = useState('');
  const options = { project, snapshot, mode, placedCount, requestedCount, utilizationPercent, unplacedLabels };

  const exportPng = async () => {
    setStatus('Creating PNG…');
    try {
      await downloadLayoutPng(options);
      trackEvent('layout_exported', { export_type: 'png' });
      setStatus('PNG downloaded.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'PNG export failed in this browser.');
    }
  };
  const copyMeasurements = async () => {
    const copied = await copyText(measurementListText(project));
    if (copied) trackEvent('layout_exported', { export_type: 'measurements-copy' });
    setStatus(copied ? 'Measurement list copied.' : 'The browser could not copy the measurement list.');
  };

  return (
    <section className="layout-export-panel" aria-labelledby="layout-export-heading">
      <div>
        <span className="step-kicker">Save or take it shopping</span>
        <h3 id="layout-export-heading">Export this layout</h3>
        <p>Images include the current manual edits. The JSON project file stores measurements and settings; saving on this device also keeps the current layouts and edits.</p>
      </div>
      <div className="export-action-grid">
        <button className="button button-primary" type="button" onClick={onSaveSession}>Save project and layouts</button>
        <button className="button button-secondary" type="button" onClick={() => { downloadProjectFile(project); trackEvent('layout_exported', { export_type: 'project-json' }); }}>Download project JSON</button>
        <button className="button button-secondary" type="button" onClick={() => { downloadLayoutSvg(options); trackEvent('layout_exported', { export_type: 'svg' }); setStatus('SVG downloaded.'); }}>Download SVG</button>
        <button className="button button-secondary" type="button" onClick={exportPng}>Download PNG</button>
        <button className="button button-secondary" type="button" onClick={() => { trackEvent('layout_exported', { export_type: 'print' }); window.print(); }}>Print plan</button>
        <button className="button button-secondary" type="button" onClick={copyMeasurements}>Copy measurements</button>
      </div>
      <p className="export-status" role="status" aria-live="polite">
        {saveStatus === 'saved' ? 'Project, generated layouts, and current manual edits are saved on this device.' : saveStatus === 'failed' ? 'The browser could not save locally. Download the JSON and an image as backups.' : status}
      </p>
    </section>
  );
}
