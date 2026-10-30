import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Repositories": "Repositories",
      "Filter by name/desc": "Filter by name/desc",
      "Prev": "Prev",
      "Next": "Next",
      "Page": "Page",
      "of": "of",
      "Top 5 Repositories": "Top 5 Repositories",
      "No description": "No description",
      "Export as Image": "Export as Image",
      "Export as PDF": "Export as PDF",
      "Commit Activity (Last 12 Weeks)": "Commit Activity (Last 12 Weeks)",
      "GitHub Portfolio Score": "GitHub Portfolio Score",
      "Score breakdown": "Score breakdown",
      "Strengths": "Strengths",
      "Red Flags": "Red Flags",
      "Suggestions": "Suggestions",
      "Language Usage": "Language Usage",
      "Analyze": "Analyze",
      "Analyzing...": "Analyzing...",
      "Enter GitHub username": "Enter GitHub username",
      "Login with GitHub": "Login with GitHub",
      "Logged in as": "Logged in as",
      "Logout": "Logout",
      "Loading...": "Loading...",
      "Add a bio to your profile": "Add a bio to your profile"
    }
  },
  es: {
    translation: {
      "Repositories": "Repositorios",
      "Filter by name/desc": "Filtrar por nombre/desc",
      "Prev": "Anterior",
      "Next": "Siguiente",
      "Page": "Página",
      "of": "de",
      "Top 5 Repositories": "Top 5 Repositorios",
      "No description": "Sin descripción",
      "Export as Image": "Exportar como Imagen",
      "Export as PDF": "Exportar como PDF",
      "Commit Activity (Last 12 Weeks)": "Actividad de Commits (Últimas 12 Semanas)",
      "GitHub Portfolio Score": "Puntaje de Portafolio GitHub",
      "Score breakdown": "Desglose de puntaje",
      "Strengths": "Fortalezas",
      "Red Flags": "Alertas",
      "Suggestions": "Sugerencias",
      "Language Usage": "Uso de Lenguajes",
      "Analyze": "Analizar",
      "Analyzing...": "Analizando...",
      "Enter GitHub username": "Ingrese usuario de GitHub",
      "Login with GitHub": "Iniciar sesión con GitHub",
      "Logged in as": "Conectado como",
      "Logout": "Cerrar sesión",
      "Loading...": "Cargando...",
      "Add a bio to your profile": "Agregue una biografía a su perfil"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    showSupportNotice: false,
  });

export default i18n;
