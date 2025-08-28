import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'zh';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'es', 'fr', 'de', 'zh'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  // Save language to localStorage when it changes
  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: handleLanguageChange, 
      t 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Translation data
const translations = {
  en: {
    // Common
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'cancel': 'Cancel',
    'save': 'Save',
    'delete': 'Delete',
    'edit': 'Edit',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'close': 'Close',
    'confirm': 'Confirm',
    
    // Navigation
    'dashboard': 'Dashboard',
    'createVault': 'Create Vault',
    'settings': 'Settings',
    'overview': 'Overview',
    'vaults': 'My Vaults',
    'beneficiaries': 'Beneficiaries',
    'timeline': 'Inheritance Timeline',
    'transactions': 'Transaction History',
    'documents': 'Documents & Metadata',
    
    // Dashboard
    'dashboardOverview': 'Dashboard Overview',
    'monitorVaults': 'Monitor your inheritance vaults and overall portfolio',
    'manageVaults': 'Manage your sBTC inheritance vaults',
    'viewBeneficiaries': 'View and manage inheritance recipients',
    'trackTimeline': 'Track inheritance deadlines and proof of life',
    'monitorTransactions': 'Monitor sBTC movements and distributions',
    'accessDocuments': 'Access vault documents and metadata',
    
    // Vault Creation
    'createSbtcVault': 'Create sBTC Inheritance Vault',
    'setupAutomated': 'Set up automated Bitcoin inheritance with programmable sBTC',
    'basicInfo': 'Basic Information',
    'vaultName': 'Vault Name',
    'inheritanceDelay': 'Inheritance Delay (days)',
    'gracePeriod': 'Grace Period (days)',
    'privacyLevel': 'Privacy Level',
    'sbtcConfig': 'sBTC Configuration',
    'reviewDeploy': 'Review & Deploy',
    
    // Settings
    'appearance': 'Appearance',
    'darkMode': 'Dark Mode',
    'switchThemes': 'Switch between light and dark themes',
    'notifications': 'Notifications',
    'emailNotifications': 'Email Notifications',
    'receiveUpdates': 'Receive updates about your vaults',
    'security': 'Security',
    'autoLock': 'Auto-Lock',
    'autoLockVaults': 'Automatically lock vaults after inactivity',
    'language': 'Language',
    'selectLanguage': 'Select Language',
    
    // Actions
    'addBeneficiary': 'Add Beneficiary',
    'deployVault': 'Deploy Vault',
    'deployingVault': 'Deploying Vault...',
    
    // Status
    'connected': 'Connected',
    'disconnected': 'Disconnected',
    'active': 'Active',
    'pending': 'Pending',
    'completed': 'Completed',
    'failed': 'Failed'
  },
  
  es: {
    // Common
    'loading': 'Cargando...',
    'error': 'Error',
    'success': 'Éxito',
    'cancel': 'Cancelar',
    'save': 'Guardar',
    'delete': 'Eliminar',
    'edit': 'Editar',
    'back': 'Atrás',
    'next': 'Siguiente',
    'previous': 'Anterior',
    'close': 'Cerrar',
    'confirm': 'Confirmar',
    
    // Navigation
    'dashboard': 'Panel',
    'createVault': 'Crear Bóveda',
    'settings': 'Configuración',
    'overview': 'Resumen',
    'vaults': 'Mis Bóvedas',
    'beneficiaries': 'Beneficiarios',
    'timeline': 'Cronología de Herencia',
    'transactions': 'Historial de Transacciones',
    'documents': 'Documentos y Metadatos',
    
    // Dashboard
    'dashboardOverview': 'Resumen del Panel',
    'monitorVaults': 'Monitorea tus bóvedas de herencia y portafolio general',
    'manageVaults': 'Gestiona tus bóvedas de herencia sBTC',
    'viewBeneficiaries': 'Ver y gestionar beneficiarios de herencia',
    'trackTimeline': 'Rastrear plazos de herencia y prueba de vida',
    'monitorTransactions': 'Monitorear movimientos y distribuciones de sBTC',
    'accessDocuments': 'Acceder a documentos y metadatos de la bóveda',
    
    // Vault Creation
    'createSbtcVault': 'Crear Bóveda de Herencia sBTC',
    'setupAutomated': 'Configurar herencia de Bitcoin automatizada con sBTC programable',
    'basicInfo': 'Información Básica',
    'vaultName': 'Nombre de la Bóveda',
    'inheritanceDelay': 'Retraso de Herencia (días)',
    'gracePeriod': 'Período de Gracia (días)',
    'privacyLevel': 'Nivel de Privacidad',
    'sbtcConfig': 'Configuración de sBTC',
    'reviewDeploy': 'Revisar y Desplegar',
    
    // Settings
    'appearance': 'Apariencia',
    'darkMode': 'Modo Oscuro',
    'switchThemes': 'Cambiar entre temas claros y oscuros',
    'notifications': 'Notificaciones',
    'emailNotifications': 'Notificaciones por Email',
    'receiveUpdates': 'Recibir actualizaciones sobre tus bóvedas',
    'security': 'Seguridad',
    'autoLock': 'Bloqueo Automático',
    'autoLockVaults': 'Bloquear bóvedas automáticamente después de inactividad',
    'language': 'Idioma',
    'selectLanguage': 'Seleccionar Idioma',
    
    // Actions
    'addBeneficiary': 'Agregar Beneficiario',
    'deployVault': 'Desplegar Bóveda',
    'deployingVault': 'Desplegando Bóveda...',
    
    // Status
    'connected': 'Conectado',
    'disconnected': 'Desconectado',
    'active': 'Activo',
    'pending': 'Pendiente',
    'completed': 'Completado',
    'failed': 'Fallido'
  },
  
  fr: {
    // Common
    'loading': 'Chargement...',
    'error': 'Erreur',
    'success': 'Succès',
    'cancel': 'Annuler',
    'save': 'Sauvegarder',
    'delete': 'Supprimer',
    'edit': 'Modifier',
    'back': 'Retour',
    'next': 'Suivant',
    'previous': 'Précédent',
    'close': 'Fermer',
    'confirm': 'Confirmer',
    
    // Navigation
    'dashboard': 'Tableau de Bord',
    'createVault': 'Créer un Coffre',
    'settings': 'Paramètres',
    'overview': 'Aperçu',
    'vaults': 'Mes Coffres',
    'beneficiaries': 'Bénéficiaires',
    'timeline': 'Chronologie de l\'Héritage',
    'transactions': 'Historique des Transactions',
    'documents': 'Documents et Métadonnées',
    
    // Dashboard
    'dashboardOverview': 'Aperçu du Tableau de Bord',
    'monitorVaults': 'Surveillez vos coffres d\'héritage et portefeuille global',
    'manageVaults': 'Gérez vos coffres d\'héritage sBTC',
    'viewBeneficiaries': 'Voir et gérer les bénéficiaires d\'héritage',
    'trackTimeline': 'Suivre les délais d\'héritage et la preuve de vie',
    'monitorTransactions': 'Surveiller les mouvements et distributions sBTC',
    'accessDocuments': 'Accéder aux documents et métadonnées du coffre',
    
    // Vault Creation
    'createSbtcVault': 'Créer un Coffre d\'Héritage sBTC',
    'setupAutomated': 'Configurer l\'héritage Bitcoin automatisé avec sBTC programmable',
    'basicInfo': 'Informations de Base',
    'vaultName': 'Nom du Coffre',
    'inheritanceDelay': 'Délai d\'Héritage (jours)',
    'gracePeriod': 'Période de Grâce (jours)',
    'privacyLevel': 'Niveau de Confidentialité',
    'sbtcConfig': 'Configuration sBTC',
    'reviewDeploy': 'Examiner et Déployer',
    
    // Settings
    'appearance': 'Apparence',
    'darkMode': 'Mode Sombre',
    'switchThemes': 'Basculer entre les thèmes clair et sombre',
    'notifications': 'Notifications',
    'emailNotifications': 'Notifications par Email',
    'receiveUpdates': 'Recevoir des mises à jour sur vos coffres',
    'security': 'Sécurité',
    'autoLock': 'Verrouillage Automatique',
    'autoLockVaults': 'Verrouiller automatiquement les coffres après inactivité',
    'language': 'Langue',
    'selectLanguage': 'Sélectionner la Langue',
    
    // Actions
    'addBeneficiary': 'Ajouter un Bénéficiaire',
    'deployVault': 'Déployer le Coffre',
    'deployingVault': 'Déploiement du Coffre...',
    
    // Status
    'connected': 'Connecté',
    'disconnected': 'Déconnecté',
    'active': 'Actif',
    'pending': 'En Attente',
    'completed': 'Terminé',
    'failed': 'Échoué'
  },
  
  de: {
    // Common
    'loading': 'Laden...',
    'error': 'Fehler',
    'success': 'Erfolg',
    'cancel': 'Abbrechen',
    'save': 'Speichern',
    'delete': 'Löschen',
    'edit': 'Bearbeiten',
    'back': 'Zurück',
    'next': 'Weiter',
    'previous': 'Zurück',
    'close': 'Schließen',
    'confirm': 'Bestätigen',
    
    // Navigation
    'dashboard': 'Dashboard',
    'createVault': 'Tresor Erstellen',
    'settings': 'Einstellungen',
    'overview': 'Übersicht',
    'vaults': 'Meine Tresore',
    'beneficiaries': 'Begünstigte',
    'timeline': 'Erbschafts-Zeitplan',
    'transactions': 'Transaktionsverlauf',
    'documents': 'Dokumente & Metadaten',
    
    // Dashboard
    'dashboardOverview': 'Dashboard-Übersicht',
    'monitorVaults': 'Überwachen Sie Ihre Erbschafts-Tresore und Gesamtportfolio',
    'manageVaults': 'Verwalten Sie Ihre sBTC-Erbschafts-Tresore',
    'viewBeneficiaries': 'Erbschafts-Begünstigte anzeigen und verwalten',
    'trackTimeline': 'Erbschafts-Fristen und Lebenszeichen verfolgen',
    'monitorTransactions': 'sBTC-Bewegungen und -Verteilungen überwachen',
    'accessDocuments': 'Auf Tresor-Dokumente und -Metadaten zugreifen',
    
    // Vault Creation
    'createSbtcVault': 'sBTC-Erbschafts-Tresor Erstellen',
    'setupAutomated': 'Automatisierte Bitcoin-Erbschaft mit programmierbarem sBTC einrichten',
    'basicInfo': 'Grundinformationen',
    'vaultName': 'Tresor-Name',
    'inheritanceDelay': 'Erbschafts-Verzögerung (Tage)',
    'gracePeriod': 'Gnadenfrist (Tage)',
    'privacyLevel': 'Datenschutzstufe',
    'sbtcConfig': 'sBTC-Konfiguration',
    'reviewDeploy': 'Überprüfen & Bereitstellen',
    
    // Settings
    'appearance': 'Erscheinungsbild',
    'darkMode': 'Dunkler Modus',
    'switchThemes': 'Zwischen hellen und dunklen Themen wechseln',
    'notifications': 'Benachrichtigungen',
    'emailNotifications': 'E-Mail-Benachrichtigungen',
    'receiveUpdates': 'Updates zu Ihren Tresoren erhalten',
    'security': 'Sicherheit',
    'autoLock': 'Auto-Sperre',
    'autoLockVaults': 'Tresore automatisch nach Inaktivität sperren',
    'language': 'Sprache',
    'selectLanguage': 'Sprache Auswählen',
    
    // Actions
    'createVault': 'Tresor Erstellen',
    'addBeneficiary': 'Begünstigten Hinzufügen',
    'deployVault': 'Tresor Bereitstellen',
    'deployingVault': 'Tresor Wird Bereitgestellt...',
    
    // Status
    'connected': 'Verbunden',
    'disconnected': 'Getrennt',
    'active': 'Aktiv',
    'pending': 'Ausstehend',
    'completed': 'Abgeschlossen',
    'failed': 'Fehlgeschlagen'
  },
  
  zh: {
    // Common
    'loading': '加载中...',
    'error': '错误',
    'success': '成功',
    'cancel': '取消',
    'save': '保存',
    'delete': '删除',
    'edit': '编辑',
    'back': '返回',
    'next': '下一步',
    'previous': '上一步',
    'close': '关闭',
    'confirm': '确认',
    
    // Navigation
    'dashboard': '仪表板',
    'createVault': '创建保险库',
    'settings': '设置',
    'overview': '概览',
    'vaults': '我的保险库',
    'beneficiaries': '受益人',
    'timeline': '继承时间线',
    'transactions': '交易历史',
    'documents': '文档和元数据',
    
    // Dashboard
    'dashboardOverview': '仪表板概览',
    'monitorVaults': '监控您的继承保险库和整体投资组合',
    'manageVaults': '管理您的sBTC继承保险库',
    'viewBeneficiaries': '查看和管理继承受益人',
    'trackTimeline': '跟踪继承截止日期和生命证明',
    'monitorTransactions': '监控sBTC流动和分配',
    'accessDocuments': '访问保险库文档和元数据',
    
    // Vault Creation
    'createSbtcVault': '创建sBTC继承保险库',
    'setupAutomated': '使用可编程sBTC设置自动化比特币继承',
    'basicInfo': '基本信息',
    'vaultName': '保险库名称',
    'inheritanceDelay': '继承延迟（天）',
    'gracePeriod': '宽限期（天）',
    'privacyLevel': '隐私级别',
    'sbtcConfig': 'sBTC配置',
    'reviewDeploy': '审查和部署',
    
    // Settings
    'appearance': '外观',
    'darkMode': '深色模式',
    'switchThemes': '在浅色和深色主题之间切换',
    'notifications': '通知',
    'emailNotifications': '电子邮件通知',
    'receiveUpdates': '接收有关您保险库的更新',
    'security': '安全',
    'autoLock': '自动锁定',
    'autoLockVaults': '不活动后自动锁定保险库',
    'language': '语言',
    'selectLanguage': '选择语言',
    
    // Actions
    'createVault': '创建保险库',
    'addBeneficiary': '添加受益人',
    'deployVault': '部署保险库',
    'deployingVault': '正在部署保险库...',
    
    // Status
    'connected': '已连接',
    'disconnected': '已断开',
    'active': '活跃',
    'pending': '待处理',
    'completed': '已完成',
    'failed': '失败'
  }
};
