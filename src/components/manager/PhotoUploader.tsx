import { useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  photos: string[];
  onUpload: (file: File) => Promise<string>;
  onRemove?: (url: string) => void;
  label?: string;
  hint?: string;
}

/** Dropzone + thumbnail grid. Calls onUpload for each file, appends URL. */
export function PhotoUploader({ photos, onUpload, onRemove, label, hint }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        try {
          await onUpload(file);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
        }
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-baseline justify-between">
          <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          {hint && <span className="text-[11.5px] text-muted-foreground">{hint}</span>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((url) => (
          <figure
            key={url}
            className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-surface"
          >
            <img
              src={url}
              alt="Hotel photo"
              className="h-full w-full object-cover"
              loading="lazy"
            />
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(url)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-black/70"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </figure>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="grid aspect-[4/3] place-items-center rounded-xl border border-dashed border-border bg-surface/40 text-muted-foreground transition-colors hover:border-primary/40 hover:bg-surface disabled:cursor-wait"
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-1.5 text-[12px]">
              <Loader2 className="h-5 w-5 animate-spin" />
              Uploading…
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-[12px]">
              <Upload className="h-5 w-5" />
              Add photo
            </div>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}
