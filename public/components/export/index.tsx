import { FunctionComponent as FC } from "preact";
import { useEffect, useState } from "preact/hooks";

export interface MemoryFile {
  filename: string;
  blob: Blob;
}

export interface ExportFileProp {
  exportText?: string;
  getFile: () => Promise<MemoryFile>;
}

interface DLC extends MemoryFile {
  url: string;
  blob: Blob;
}

export const ExportFile: FC<ExportFileProp> = ({ exportText, getFile }) => {
  const [dlc, setDLC] = useState<DLC | null>(null);
  const handleExport = async () => {
    const file = await getFile();
    setDLC({
      ...file,
      url: URL.createObjectURL(file.blob),
    });
  };
  const handleComplete = () => {
    setDLC(null);
  };
  useEffect(() => {
    return () => {
      if (dlc != null) {
        URL.revokeObjectURL(dlc.url);
      }
    };
  }, [dlc]);
  return (
    <>
      <div class="my-3">
        <button class="btn btn-primary" onClick={handleExport}>
          {exportText || "导出文件"}
        </button>
      </div>
      {dlc != null && (
        <div class="my-3">
          <a class="primary-link mx-3" href={dlc.url} download={dlc.filename}>
            点击下载
          </a>
          <button class="btn btn-secondary" onClick={handleComplete}>
            删除链接
          </button>
        </div>
      )}
    </>
  );
};
