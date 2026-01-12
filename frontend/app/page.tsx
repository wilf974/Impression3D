import Link from 'next/link';
import { ArrowRight, Cube, Image, Type } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
            Impression<span className="text-purple-400">3D</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Générez des fichiers STL pour l'impression 3D à partir de texte ou d'images
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {/* Text to 3D */}
          <Link href="/generate/text-to-3d">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all cursor-pointer border border-white/20 hover:scale-105 transform">
              <div className="flex items-center justify-center w-16 h-16 bg-purple-500 rounded-full mb-6">
                <Type className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Texte vers 3D</h2>
              <p className="text-gray-300 mb-6">
                Décrivez votre modèle en texte et laissez l'IA créer un fichier STL imprimable en 3D
              </p>
              <div className="flex items-center text-purple-400 font-semibold">
                Commencer <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>

          {/* Image to 3D */}
          <Link href="/generate/image-to-3d">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 hover:bg-white/20 transition-all cursor-pointer border border-white/20 hover:scale-105 transform">
              <div className="flex items-center justify-center w-16 h-16 bg-blue-500 rounded-full mb-6">
                <Image className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Image vers 3D</h2>
              <p className="text-gray-300 mb-6">
                Téléchargez une image 2D et convertissez-la en modèle 3D imprimable
              </p>
              <div className="flex items-center text-blue-400 font-semibold">
                Commencer <ArrowRight className="ml-2 w-5 h-5" />
              </div>
            </div>
          </Link>
        </div>

        {/* Gallery Link */}
        <div className="text-center">
          <Link href="/gallery">
            <button className="bg-white/10 backdrop-blur-lg text-white px-8 py-4 rounded-full hover:bg-white/20 transition-all border border-white/20 flex items-center mx-auto">
              <Cube className="w-5 h-5 mr-2" />
              Voir la galerie
            </button>
          </Link>
        </div>

        {/* Features List */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            Fonctionnalités
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-purple-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Rapide</h4>
              <p className="text-gray-400 text-sm">
                Génération en moins de 30 secondes
              </p>
            </div>
            <div className="text-center">
              <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Précis</h4>
              <p className="text-gray-400 text-sm">
                Modèles IA de dernière génération
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-500/20 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🖨️</span>
              </div>
              <h4 className="text-white font-semibold mb-2">Imprimable</h4>
              <p className="text-gray-400 text-sm">
                Fichiers STL prêts à imprimer
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
