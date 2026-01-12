'use client';

import { useState, useRef } from 'react';
import { ArrowLeft, Upload, Download, Loader2, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ImageTo3D() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner un fichier image');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Le fichier doit faire moins de 10MB');
      return;
    }

    setSelectedFile(file);
    setError(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setError('Veuillez sélectionner une image');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus('Téléchargement de l\'image...');

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('quality', quality);

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/image-to-3d`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Échec de la génération');
      }

      const data = await response.json();
      setTaskId(data.task_id);
      setStatus('Reconstruction 3D en cours...');

      // Poll for status (simplified version)
      // In production, use WebSocket for real-time updates

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <button className="text-white flex items-center hover:text-blue-300 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Image vers 3D</h1>
          <p className="text-gray-300 mb-8">
            Téléchargez une image 2D et convertissez-la en modèle 3D imprimable
          </p>

          {/* Generation Form */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <form onSubmit={handleGenerate}>
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Image source
                  </label>

                  {!selectedFile ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/30 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 transition-all"
                    >
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-white mb-2">
                        Cliquez pour télécharger une image
                      </p>
                      <p className="text-gray-400 text-sm">
                        PNG, JPG ou WebP (max 10MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="relative aspect-square rounded-lg overflow-hidden">
                        {previewUrl && (
                          <Image
                            src={previewUrl}
                            alt="Preview"
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-gray-300 text-sm mt-2">
                        {selectedFile.name}
                      </p>
                    </div>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Qualité de reconstruction
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q)}
                        className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                          quality === q
                            ? 'bg-blue-500 text-white'
                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {q === 'low' ? 'Basse' : q === 'medium' ? 'Moyenne' : 'Haute'}
                      </button>
                    ))}
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
                    {error}
                  </div>
                )}

                {status && (
                  <div className="mb-6 p-4 bg-blue-500/20 border border-blue-500 rounded-lg text-blue-200">
                    {status}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || !selectedFile}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Génération...
                    </>
                  ) : (
                    'Générer le modèle 3D'
                  )}
                </button>
              </form>
            </div>

            {/* Right: Preview */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-white font-semibold mb-4">Aperçu du modèle 3D</h3>
              <div className="aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                ) : modelUrl ? (
                  <div className="text-white">Modèle 3D ici</div>
                ) : (
                  <p className="text-gray-400 text-center px-4">
                    Le modèle 3D apparaîtra ici après la génération
                  </p>
                )}
              </div>

              {modelUrl && (
                <button className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center">
                  <Download className="w-5 h-5 mr-2" />
                  Télécharger le STL
                </button>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-semibold mb-4">💡 Conseils</h3>
            <ul className="text-gray-300 space-y-2">
              <li>• Utilisez des images avec un fond neutre pour de meilleurs résultats</li>
              <li>• Les objets centrés et bien éclairés fonctionnent mieux</li>
              <li>• Évitez les images floues ou avec des reflets</li>
              <li>• La qualité haute donne plus de détails mais prend plus de temps</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
