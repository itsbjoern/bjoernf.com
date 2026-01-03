import { useExport } from "../Context/ExportContext";

export const ExportModal = () => {
  const { isExporting, progress, currentFormat, error } = useExport();

  if (!isExporting && !error) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <h3 className="text-xl font-semibold mb-4">
          {error ? "Export Failed" : `Exporting ${currentFormat?.toUpperCase()}...`}
        </h3>

        {error ? (
          <div className="text-red-600 mb-4">{error}</div>
        ) : (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress.percentage)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${Math.round(progress.percentage)}%` }}
                />
              </div>
            </div>

            <p className="text-sm text-gray-600">
              {progress.message}
            </p>
          </>
        )}
      </div>
    </div>
  );
};
