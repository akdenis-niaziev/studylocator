import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useAuth } from "../contexts/AuthContext";
import { checkInService } from "../services/checkInService";
import { gamificationService } from "../services/gamificationService";
import { locationService } from "../services/locationService";
import { CheckIn } from "../types/checkin";
import { motion, AnimatePresence } from "framer-motion";

interface QRScannerProps {
  onCheckInSuccess?: (checkIn: CheckIn) => void;
  onClose?: () => void;
}

export function QRScanner({ onCheckInSuccess, onClose }: QRScannerProps) {
  const { userId } = useAuth();
  const [isScanning, setIsScanning] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">(
    "info"
  );
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [activeCheckIn, setActiveCheckIn] = useState<CheckIn | null>(null);

  useEffect(() => {
    if (userId) {
      const active = checkInService.getActiveCheckIn(userId);
      setActiveCheckIn(active);
    }

    return () => {
      if (scanner) {
        scanner.stop().catch(console.error);
      }
    };
  }, [userId]);

  const startScanning = async () => {
    try {
      const html5QrCode = new Html5Qrcode("qr-reader");
      setScanner(html5QrCode);

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        onScanError
      );

      setIsScanning(true);
      setMessage("Scan de QR code op de locatie");
      setMessageType("info");
    } catch (err) {
      console.error("Error starting scanner:", err);
      setMessage("Kon camera niet starten. Controleer de permissies.");
      setMessageType("error");
    }
  };

  const stopScanning = async () => {
    if (scanner) {
      try {
        await scanner.stop();
        setIsScanning(false);
        setScanner(null);
      } catch (err) {
        console.error("Error stopping scanner:", err);
      }
    }
  };

  const onScanSuccess = async (decodedText: string) => {
    console.log("QR Code scanned:", decodedText);

    await stopScanning();

    const locationId = checkInService.validateQRCode(decodedText);

    if (!locationId) {
      setMessage("Ongeldige QR code. Scan een Study Spaces QR code.");
      setMessageType("error");
      return;
    }

    const location = await locationService.getLocationById(locationId);
    if (!location) {
      setMessage("Locatie niet gevonden.");
      setMessageType("error");
      return;
    }

    const checkIn = checkInService.checkIn(locationId, userId);

    gamificationService.updateStatsAfterCheckIn(checkIn, userId);

    setMessage(`✅ Ingecheckt bij ${location.name}!`);
    setMessageType("success");
    setActiveCheckIn(checkIn);

    if (onCheckInSuccess) {
      onCheckInSuccess(checkIn);
    }
  };

  const onScanError = (errorMessage: string) => {
    console.log("Scan error:", errorMessage);
  };

  const handleCheckOut = async () => {
    if (!activeCheckIn) return;

    const checkedOut = checkInService.checkOut(activeCheckIn.id);
    if (checkedOut) {
      gamificationService.updateStatsAfterCheckOut(checkedOut, userId);

      const location = await locationService.getLocationById(
        checkedOut.locationId
      );
      const duration = checkedOut.duration || 0;
      const hours = Math.floor(duration / 60);
      const minutes = duration % 60;

      setMessage(
        `✅ Uitgecheckt van ${location?.name}. Studietijd: ${hours}u ${minutes}m`
      );
      setMessageType("success");
      setActiveCheckIn(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4 pb-24 transition-colors">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-4 sm:p-6 shadow-xl border border-gray-100 dark:border-gray-700"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📷 QR Check-in
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-full p-2 transition-colors active:scale-95"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeCheckIn && !isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-base sm:text-lg">
                    ✅ Currently Checked In
                  </p>
                  <p className="text-green-600 dark:text-green-400 text-sm">
                    Since{" "}
                    {new Date(activeCheckIn.timestamp).toLocaleTimeString(
                      "nl-BE",
                      { hour: "2-digit", minute: "2-digit" }
                    )}
                  </p>
                </div>
                <button
                  onClick={handleCheckOut}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all shadow-md shadow-blue-500/20"
                >
                  Check Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!activeCheckIn && (
          <>
            <div
              id="qr-reader"
              className="mb-4 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700 border-2 border-gray-100 dark:border-gray-600"
              style={{ minHeight: isScanning ? "280px" : "0" }}
            >
              {isScanning && (
                <div className="absolute inset-0 border-2 border-blue-500/50 rounded-xl pointer-events-none animate-pulse z-10"></div>
              )}
            </div>

            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`mb-4 p-4 rounded-xl text-center text-sm sm:text-base font-medium ${
                    messageType === "success"
                      ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
                      : messageType === "error"
                      ? "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
                      : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800"
                  }`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            {!isScanning ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startScanning}
                className="w-full px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-lg shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
              >
                <span>📷</span> Start Camera & Scan
              </motion.button>
            ) : (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={stopScanning}
                className="w-full px-6 py-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 font-bold text-lg transition-all flex items-center justify-center gap-2"
              >
                <span>⏹️</span> Stop Scanning
              </motion.button>
            )}

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-xl">🎯</span>
                <span>Find the QR code at the study location</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-xl">📱</span>
                <span>Point your camera at the code</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400 text-sm bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                <span className="text-xl">🏆</span>
                <span>Earn XP & badges automatically!</span>
              </div>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
