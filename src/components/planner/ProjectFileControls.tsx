import { useRef, type ChangeEvent } from 'react';
import type { ShelfSketchProject } from '../../types/domain';

interface Props {
  project: ShelfSketchProject;
  saveStatus: 'idle' | 'saved' | 'failed';
  importStatus: string;
  clearStatus: string;
  onSave: () => void;
  onExport: () => void;
  onImport: (file: File) => Promise<void>;
  onClearLocal: () => void;
}

export default function ProjectFileControls({ project, saveStatus, importStatus, clearStatus, onSave, onExport, onImport, onClearLocal }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (file) await onImport(file);
  };
  return (
    <section className="project-file-controls" aria-labelledby="project-file-heading">
      <div>
        <span className="step-kicker">Keep a copy</span>
        <h3 id="project-file-heading">Save, export, or import the project</h3>
        <p>Local save can include generated layouts and manual edits. The JSON file contains the measurements and settings, so layouts can be generated again on another device.</p>
      </div>
      <div className="project-file-actions">
        <button className="button button-primary" type="button" onClick={onSave}>Save on this device</button>
        <button className="button button-secondary" type="button" onClick={onExport}>Download project JSON</button>
        <button className="button button-secondary" type="button" onClick={() => inputRef.current?.click()}>Import project JSON</button>
        <input ref={inputRef} className="visually-hidden-file" type="file" accept="application/json,.json" onChange={handleFile} aria-label="Choose a ShelfSketch JSON project file" />
        <button className="button button-secondary danger-button" type="button" onClick={onClearLocal}>Delete local ShelfSketch data</button>
      </div>
      <div className="file-status-stack" aria-live="polite">
        {saveStatus === 'saved' && <p>Saved locally on this device. Project measurements were not uploaded.</p>}
        {saveStatus === 'failed' && <p>The browser could not save this project. Download the JSON file as a backup instead.</p>}
        {importStatus && <p>{importStatus}</p>}
        {clearStatus && <p>{clearStatus}</p>}
      </div>
      <p className="file-privacy-note">Project: <strong>{project.name}</strong>. Imported files are validated locally before replacing the current project.</p>
    </section>
  );
}
