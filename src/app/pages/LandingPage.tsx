import { useNavigate } from 'react-router';
import { Activity, Database, Cpu, TrendingUp, Zap, Server, ArrowRight, Users, Target, Cog } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();

  const teamMembers = [
    'Rezgui Darine',
    'Dhaouadi Nour Elhouda',
    'Arif Nour',
    'Zakraoui Ayet allah'
  ];

  const features = [
    {
      icon: Activity,
      title: 'Capteurs IoT',
      description: 'Surveillance en temps réel des vibrations, température et courant électrique',
      color: 'text-blue-400',
      bgColor: 'bg-blue-950/50'
    },
    {
      icon: Database,
      title: 'Big Data',
      description: 'Traitement massif de 2,4 To de données par jour avec Kafka et TimescaleDB',
      color: 'text-purple-400',
      bgColor: 'bg-purple-950/50'
    },
    {
      icon: TrendingUp,
      title: 'Maintenance Prédictive',
      description: 'Algorithmes d\'analyse pour anticiper les pannes avant qu\'elles se produisent',
      color: 'text-green-400',
      bgColor: 'bg-green-950/50'
    },
    {
      icon: Zap,
      title: 'Temps Réel',
      description: 'Mise à jour automatique toutes les 5 secondes pour une surveillance continue',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-950/50'
    }
  ];

  const workflow = [
    {
      step: '01',
      title: 'Collecte des Données',
      description: 'Les capteurs IoT installés sur les machines envoient des données en continu (vibrations, température, courant)',
      icon: Activity
    },
    {
      step: '02',
      title: 'Traitement Big Data',
      description: 'Les données sont traitées par Kafka (850k messages/seconde) et stockées dans TimescaleDB',
      icon: Server
    },
    {
      step: '03',
      title: 'Analyse Prédictive',
      description: 'Des algorithmes analysent les données pour détecter les anomalies et prédire les pannes',
      icon: Cpu
    },
    {
      step: '04',
      title: 'Alertes & Actions',
      description: 'Le système génère des alertes et recommande des maintenances préventives pour éviter les arrêts',
      icon: TrendingUp
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/20 via-slate-950 to-purple-950/20"></div>
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.1) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }}></div>

        <div className="relative container mx-auto px-6 py-20">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-6 px-4 py-2 bg-blue-950/50 border border-blue-900/50 rounded-full">
              <Activity className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-blue-400 font-semibold">Projet Big Data & IoT</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Plateforme de Surveillance IoT<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                pour Maintenance Prédictive
              </span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
              Une solution intelligente qui combine l'Internet des Objets et le Big Data pour anticiper 
              les pannes industrielles et optimiser la maintenance dans l'Industrie 4.0
            </p>

            <Button 
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:shadow-blue-600/30"
            >
              Accéder au Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Team Section */}
          <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm p-8 mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Réalisé par</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teamMembers.map((member, index) => (
                <div 
                  key={index}
                  className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-center hover:border-blue-600/50 transition-colors"
                >
                  <div className="w-12 h-12 bg-blue-950 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-400 font-bold text-lg">{member.split(' ')[0][0]}{member.split(' ')[1][0]}</span>
                  </div>
                  <p className="text-white font-semibold">{member}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Objectifs Section */}
      <div className="bg-slate-900/50 py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Target className="w-6 h-6 text-green-400" />
            <h2 className="text-3xl font-bold text-white">Objectifs du Projet</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-white mb-3">Prévenir les Pannes</h3>
              <p className="text-slate-300">
                Anticiper les défaillances des machines avant qu'elles ne se produisent pour éviter 
                les arrêts de production coûteux
              </p>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="text-4xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-white mb-3">Réduire les Coûts</h3>
              <p className="text-slate-300">
                Optimiser les interventions de maintenance en les planifiant au bon moment, 
                réduisant ainsi les coûts de maintenance corrective
              </p>
            </Card>

            <Card className="bg-slate-900 border-slate-800 p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Améliorer la Productivité</h3>
              <p className="text-slate-300">
                Maximiser le temps de fonctionnement des machines et améliorer l'efficacité 
                globale de la production industrielle
              </p>
            </Card>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="flex items-center gap-3 mb-8">
            <Cog className="w-6 h-6 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Fonctionnalités Principales</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-900 border-slate-800 p-6 hover:border-slate-700 transition-colors">
                <div className={`p-3 rounded-lg ${feature.bgColor} w-fit mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <div className="bg-slate-900/50 py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Comment ça Fonctionne ?</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Le système suit un processus en 4 étapes pour transformer les données brutes des capteurs 
              en alertes et recommandations actionnables
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((item, index) => (
              <div key={index} className="relative">
                <Card className="bg-slate-900 border-slate-800 p-6 h-full hover:border-blue-600/50 transition-colors">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="text-3xl font-bold text-blue-600">{item.step}</div>
                    <div className="p-2 bg-blue-950/50 rounded-lg">
                      <item.icon className="w-5 h-5 text-blue-400" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-slate-400 text-sm">{item.description}</p>
                </Card>
                {index < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Technologies Section */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Technologies Utilisées</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Cette plateforme simule une infrastructure Big Data complète avec des technologies modernes
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {['Apache Kafka', 'Apache Spark', 'TimescaleDB', 'React', 'IoT Sensors', 'Machine Learning', 'Real-time Analytics', 'Predictive AI'].map((tech, index) => (
              <div key={index} className="p-4 bg-slate-900 border border-slate-800 rounded-lg text-center hover:border-blue-600/50 transition-colors">
                <p className="text-white font-semibold">{tech}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16">
        <div className="container mx-auto px-6">
          <Card className="bg-gradient-to-r from-blue-950/50 to-purple-950/50 border-blue-900/50 p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Prêt à découvrir la plateforme ?
            </h2>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Explorez le tableau de bord en temps réel et visualisez comment la maintenance prédictive 
              transforme l'industrie 4.0
            </p>
            <Button 
              onClick={() => navigate('/dashboard')}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:shadow-xl hover:shadow-blue-600/30"
            >
              Lancer le Dashboard
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="container mx-auto px-6 text-center text-slate-500 text-sm">
          <p>© 2026 - Projet Big Data & IoT - Maintenance Prédictive Industrielle</p>
        </div>
      </footer>
    </div>
  );
}
