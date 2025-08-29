"use client";

import { useState } from "react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Card, CardHeader, CardContent } from "~/components/ui/card";

interface IdentificationResult {
  nombre_comun: string;
  nombre_cientifico: string;
  habitat: string;
  estado_conservacion: string;
}

const API_KEY = "AIzaSyAHz636DUAPblIu46XQe8flndaxMbVNWL0";

export default function HomePage() {
  const [imageUrl, setImageUrl] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0]);
      setImageUrl(""); // Limpiar el campo URL si se sube archivo
    }
  };

  const identifyImage = async () => {
    setLoading(true);
    try {
      const body: { apiKey: string; imageBase64?: string | ArrayBuffer | null; imageUrl?: string } = { apiKey: API_KEY };

      if (imageFile) {
        const reader = new FileReader();
        reader.onloadend = async () => {
          body.imageBase64 = reader.result;
          await sendRequest(body);
        };
        reader.readAsDataURL(imageFile);
        return;
      } else if (imageUrl) {
        body.imageUrl = imageUrl;
        await sendRequest(body);
        return;
      } else {
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      setLoading(false);
    }
  };

  const sendRequest = async (body: { apiKey: string; imageBase64?: string | ArrayBuffer | null; imageUrl?: string }) => {
    try {
      const res = await fetch("/api/identify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        console.error("Error en la identificación");
        setLoading(false);
        return;
      }

      const data = (await res.json()) as IdentificationResult;
      setResult(data);
    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
    }
    setLoading(false);
  };

  return (
    <main
      className="flex flex-col items-center justify-center min-h-screen p-6"
      style={{
        background: "linear-gradient(135deg, #e6ffe6 0%, #b3ffb3 100%), url('/forest-bg.jpg') center/cover no-repeat",
        backdropFilter: "blur(2px)",
      }}
    >
      <Card className="bg-white/80 rounded-3xl shadow-2xl p-8 max-w-lg w-full flex flex-col items-center border border-green-200">
        <CardHeader>
          <h1 className="text-4xl font-extrabold mb-4 text-green-700 drop-shadow-lg">EcoVision</h1>
          <p className="mb-6 text-green-900 text-center font-medium">
            Identifica flora y fauna subiendo una imagen o ingresando una URL.<br />
            <span className="text-green-500">¡Descubre la naturaleza con IA!</span>
          </p>
        </CardHeader>
        <CardContent className="w-full flex flex-col gap-4 mb-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="file:bg-green-600 file:text-white file:rounded file:px-4 file:py-2 file:border-none file:mr-4 border rounded p-2 w-full bg-white/90"
          />
          <Input
            type="text"
            placeholder="O pega la URL de la imagen"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setImageFile(null);
            }}
            className="border p-2 rounded w-full bg-white/90"
          />
          <Button
            onClick={identifyImage}
            disabled={loading || (!imageUrl && !imageFile)}
            className="bg-gradient-to-r from-green-600 to-green-400 text-white px-6 py-2 rounded-full mt-2 shadow-lg transition-all hover:scale-105"
          >
            {loading ? "Identificando..." : "Identificar"}
          </Button>
        </CardContent>
        {result && (
          <Card className="mt-8 p-6 bg-gradient-to-br from-green-50 to-white/80 shadow-xl rounded-2xl w-full border border-green-100">
            <CardHeader>
              <h2 className="text-2xl font-bold text-green-700 mb-2">{result.nombre_comun}</h2>
            </CardHeader>
            <CardContent>
              <p className="mb-1"><strong className="text-green-600">Nombre científico:</strong> {result.nombre_cientifico}</p>
              <p className="mb-1"><strong className="text-green-600">Hábitat:</strong> {result.habitat}</p>
              <p><strong className="text-green-600">Estado de conservación:</strong> {result.estado_conservacion}</p>
            </CardContent>
          </Card>
        )}
      </Card>
      <style>{`
        main {
          position: relative;
        }
        main:before {
          content: "";
          position: absolute;
          inset: 0;
          background: url('/forest-bg.jpg') center/cover no-repeat;
          opacity: 0.25;
          z-index: -1;
          filter: blur(4px);
        }
      `}</style>
    </main>
  );
}
