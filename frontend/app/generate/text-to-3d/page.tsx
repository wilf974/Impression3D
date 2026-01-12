'use client';

import { useState } from 'react';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TextTo3D() {
  const [prompt, setPrompt] = useState('');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('');
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) {
      setError('Veuillez entrer une description');
      return;
    }

    setIsLoading(true);
    setError(null);
    setStatus('En attente...');

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/api/v1/text-to-3d`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, quality }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Échec de la génération');
      }

      const data = await response.json();
      setTaskId(data.task_id);
      setStatus('Traitement en cours...');

      // Poll for status (simplified version)
      // In production, use WebSocket for real-time updates

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <button className="text-white flex items-center hover:text-purple-300 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Texte vers 3D</h1>
          <p className="text-gray-300 mb-8">
            Décrivez votre modèle et notre IA créera un fichier STL imprimable
          </p>

          {/* Generation Form */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <form onSubmit={handleGenerate}>
                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Description du modèle
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Ex: Un vase moderne avec des motifs géométriques"
                    className="w-full bg-white/5 text-white border border-white/20 rounded-lg p-4 h-32 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    maxLength={500}
                  />
                  <p className="text-gray-400 text-sm mt-2">
                    {prompt.length}/500 caractères
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-white font-semibold mb-2">
                    Qualité
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q)}
                        className={`py-2 px-4 rounded-lg font-semibold transition-all ${
                          quality === q
                            ? 'bg-purple-500 text-white'
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
                  disabled={isLoading || !prompt.trim()}
                  className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center"
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
              <h3 className="text-white font-semibold mb-4">Aperçu du modèle</h3>
              <div className="aspect-square bg-slate-900/50 rounded-lg flex items-center justify-center">
                {isLoading ? (
                  <Loader2 className="w-12 h-12 text-purple-400 animate-spin" />
                ) : modelUrl ? (
                  <div className="text-white">Modèle 3D ici</div>
                ) : (
                  <p className="text-gray-400">
                    Le modèle apparaîtra ici après la génération
                  </p>
                )}
              </div>

              {modelUrl && (
                <button className="w-full mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center">
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
              <li>• Soyez précis dans votre description</li>
              <li>• Mentionnez les formes, textures et détails importants</li>
              <li>• La qualité haute prend plus de temps mais donne de meilleurs résultats</li>
              <li>• Les modèles simples fonctionnent mieux que les scènes complexes</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
