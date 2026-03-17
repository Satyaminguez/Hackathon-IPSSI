import React from "react";
import { Link } from "react-router-dom";
import NavAuth from "../auth/NavAuth";

export default function Pricing() {
  return (
    <div className="bg-slate-800 text-white">
      <NavAuth font="bg-slate-800" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
              Nos Formules
            </h2>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Des solutions flexibles adaptées à vos besoins. Choisissez le plan
              qui correspond le mieux à votre utilisation de stockage.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            <div className="bg-slate-900 shadow-2xl rounded-xl px-6 py-12 ring-1 ring-gray-200 border-2 border-slate-600">
              <h3 className="text-xl font-bold text-blue-600">Startup</h3>
              <p className="mt-4 text-gray-600">
                Idéal pour les utilisateurs avec des besoins de stockage
                modérés.
              </p>

              <div className="mt-4">
                <div className="flex items-baseline">
                  <span className="text-4xl font-semibold">€20</span>
                  <span className="ml-1 text-sm font-medium text-gray-500">
                    / une fois
                  </span>
                </div>
                <Link
                  to="/payment"
                  className="mt-6 block w-full text-center rounded-md bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Obtenir l'accès
                </Link>
              </div>

              <ul className="mt-6 space-y-4 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-indigo-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-3">Accès au stockage en ligne</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-indigo-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-3">Sécurité des données</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-indigo-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-3">Outils de gestion performants</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-indigo-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-3">Assistance technique 24/7</span>
                </li>
              </ul>
            </div>

            <div className="bg-slate-900 shadow-xl rounded-xl px-6 py-12 ring-1 ring-gray-200 border border-slate-300">
              <h3 className="text-xl font-bold text-blue-600">Business</h3>
              <p className="mt-4 text-gray-600">
                Idéal pour les utilisateurs avec des besoins de stockage
                modérés.
              </p>

              <div className="mt-4">
                <Link className="mt-6 block w-full text-center rounded-md px-4 py-3 text-sm font-semibold text-blue-600 shadow-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  Nous contacter
                </Link>
              </div>

              <ul className="mt-6 space-y-4 text-sm text-gray-600">
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-indigo-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-3">Accès au stockage en ligne</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-indigo-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-3">Sécurité des données</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-indigo-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-3">Outils de gestion performants</span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="h-5 w-5 text-indigo-600 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="ml-3">Assistance technique 24/7</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
