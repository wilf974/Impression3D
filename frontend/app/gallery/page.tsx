'use client';

import { ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

export default function Gallery() {
  // Mock data - will be replaced with real data from API
  const models = [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <button className="text-white flex items-center hover:text-indigo-300 transition-colors">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </button>
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white mb-2">Galerie</h1>
          <p className="text-gray-300 mb-8">
            Parcourez vos modèles 3D générés
          </p>

          {models.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-16 border border-white/20 text-center">
              <p className="text-gray-300 text-lg mb-6">
                Vous n'avez pas encore généré de modèles 3D
              </p>
              <div className="flex gap-4 justify-center">
                <Link href="/generate/text-to-3d">
                  <button className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition-all">
                    Texte vers 3D
                  </button>
                </Link>
                <Link href="/generate/image-to-3d">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-all">
                    Image vers 3D
                  </button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {models.map((model: any, index: number) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="aspect-square bg-slate-900/50 rounded-lg mb-4"></div>
                  <h3 className="text-white font-semibold mb-2">Modèle {index + 1}</h3>
                  <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center text-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
