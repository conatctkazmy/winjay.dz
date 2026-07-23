let isDarkMode = false;
function applyTouchDeviceClass() {
    try {
        const ua = String(navigator.userAgent || '');
        const isMobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
        const maxTouchPoints = Number(navigator.maxTouchPoints || 0);
        const hasTouch = maxTouchPoints > 0 || ('ontouchstart' in window);
        const mqCoarse = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
        const mqHoverNone = !!(window.matchMedia && window.matchMedia('(hover: none)').matches);
        const sw = (window.screen && window.screen.width) ? Number(window.screen.width) : Number(window.innerWidth);
        const sh = (window.screen && window.screen.height) ? Number(window.screen.height) : Number(window.innerHeight);
        const smallScreen = Math.min(sw || 0, sh || 0) > 0 ? Math.min(sw, sh) <= 820 : false;
        const should = (hasTouch && smallScreen) || (mqCoarse && mqHoverNone) || (isMobileUA && smallScreen);
        document.documentElement.classList.toggle('is-touch-device', !!should);
    } catch (e) {
        null;
    }
}

applyTouchDeviceClass();
window.addEventListener('orientationchange', () => setTimeout(applyTouchDeviceClass, 180));

const DEFAULT_AVATAR_SVG = "data:image/svg+xml,%3Csvg xmlns='http%3A//www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='20' fill='%23e2e8f0'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%2394a3b8'/%3E%3Cellipse cx='20' cy='35' rx='12' ry='8' fill='%2394a3b8'/%3E%3C/svg%3E";

function createEmptyUserProfile() {
    return {
        userId: null,
        name: "Guest",
        tag: "@guest",
        profilePic: DEFAULT_AVATAR_SVG,
        coverPic: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200",
        location: "",
        businessType: "Particulier",
        phone: "",
        workCategory: "",
        workCategoryId: null,
        identityInitializedAt: null,
        identityChangeCount: 0,
        joinedDate: "",
        rating: 0,
        reviews: 0,
        isVip: false,
        verified: false,
        isAdmin: false,
        reviewsData: [],
        cachedAt: 0
    };
}

let userProfile = createEmptyUserProfile();

const USER_PROFILE_STORAGE_KEY = 'winjayUserProfileV1';
const FREE_VERIFIED_PROGRAM_STORAGE_KEY = 'winjayFreeVerifiedProgramV1';
const VERIFIED_QUEST_STORAGE_KEY = 'winjayVerifiedQuestV1';
const THEME_STORAGE_KEY = 'winjayThemeV1';
const LOGIN_FAIL_COUNT_STORAGE_KEY = 'winjayLoginFailCountV1';
const LOGIN_COOLDOWN_UNTIL_STORAGE_KEY = 'winjayLoginCooldownUntilV1';
const LANGUAGE_STORAGE_KEY = 'winjayLangV1';
const MY_PROFILE_LAST_TAB_STORAGE_KEY = 'winjayMyProfileLastTabV1';
const LIVE_SHOPPING_TRAY_STORAGE_KEY = 'winjayLiveShoppingTrayV1';
const FREE_VERIFIED_TOTAL = 1000;
const REFERRALS_REQUIRED = 10;
const MARKETPLACE_LISTINGS_STORAGE_KEY = 'marketplaceListingsV1';
const LISTING_IMAGES_BUCKET = 'listing-images';
const LISTING_VIDEOS_BUCKET = 'listing-videos';
const PROFILE_IMAGES_BUCKET = 'profile-images';
const MESSAGE_MEDIA_BUCKET = 'message-media';
const IDENTITY_DOCS_BUCKET = 'identity-docs';
const COURSE_PUBLIC_BUCKET = 'course-public';
const COURSE_VIDEOS_BUCKET = 'course-videos';
const FREE_LISTING_LIMIT = 4;
const SELLER_PROFILE_LAST_TAG_STORAGE_KEY = 'winjayLastSellerProfileTagV1';
const INITIAL_LISTINGS_FETCH_LIMIT = 24;
const LISTINGS_FETCH_PAGE_SIZE = 24;

const SUPPORTED_LANGS = ['fr', 'ar', 'en'];
let currentLang = 'fr';

const I18N = {
    fr: {
        lang_current: 'Français',
        search_placeholder: 'Rechercher des annonces...',
        search_clear_history: 'Effacer l’historique',
        home_hero_title: 'Trouvez ce dont vous avez besoin, localement.',
        home_hero_subtitle: 'Le meilleur marché pour tout.',
        home_sort_newest: 'Plus récents',
        home_sort_price_asc: 'Prix croissant',
        home_sort_price_desc: 'Prix décroissant',
        filter_button: 'Filtres',
        filter_price_title: 'Prix (DA)',
        filter_wilaya_title: 'Wilaya',
        filter_wilaya_all: 'Toutes les wilayas',
        filter_category_title: 'Catégorie',
        filter_category_all: 'Toutes les catégories',
        filter_clear: 'Effacer les filtres',
        home_categories_title: 'Catégories',
        home_categories_back: 'Retour',
        price_min: 'Min',
        price_max: 'Max',
        load_more: 'Charger plus',
        empty_title: 'Aucune annonce trouvée',
        empty_subtitle: 'Essayez de modifier vos filtres ou votre recherche.',
        reset_filters: 'Réinitialiser les filtres',
        messages_search_placeholder: 'Rechercher',
        chat_write_message_placeholder: 'Écrire un message...',
        edit_profile_title: 'Modifier le profil',
        label_name: 'Nom',
        label_username: "Nom d'utilisateur",
        label_location: 'Localisation',
        label_account_type: 'Type de compte',
        label_phone: 'Numéro de téléphone',
        label_work_category: 'Catégorie de travail',
        save_changes: 'Enregistrer les modifications',
        category_search_placeholder: 'Rechercher une catégorie...',
        select_search_placeholder: 'Rechercher...',
        theme_dark_mode: 'Mode sombre',
        sidebar_categories: 'Catégories',
        cat_all: 'Tous',
        cat_vehicles: 'Véhicules',
        cat_real_estate: 'Immobilier',
        cat_electronics: 'Électronique',
        cat_jobs_services: 'Emploi & Services',
        cat_home_garden: 'Maison & Jardin',
        cat_fashion_beauty: 'Mode & Beauté',
        cat_leisure_entertainment: 'Loisirs & Divertissement',
        cat_it: 'Informatique',
        cat_telephony: 'Téléphonie',
        cat_sport_health: 'Sport & Santé',
        cat_pro_equipment: 'Matériel Pro',
        cat_other: 'Autres',
        sidebar_following: 'Abonnements',
        sidebar_see_all: 'Voir tout',
        sidebar_community: 'Communauté',
        sidebar_ambassadors: 'Ambassadeurs',
        sidebar_my_actions: 'Mes actions',
        sidebar_favorites: 'Favoris',
        sidebar_messages: 'Messages',
        sidebar_become_verified: 'Devenir Vérifié',
        sidebar_become_vip: 'Devenir VIP',
        sidebar_settings: 'Paramètres',
        sidebar_courses: 'Cours'
    },
    en: {
        lang_current: 'English',
        search_placeholder: 'Search listings...',
        search_clear_history: 'Clear history',
        home_hero_title: 'Find what you need, locally.',
        home_hero_subtitle: 'The best marketplace for everything.',
        home_sort_newest: 'Newest',
        home_sort_price_asc: 'Price: low to high',
        home_sort_price_desc: 'Price: high to low',
        filter_button: 'Filters',
        filter_price_title: 'Price (DZD)',
        filter_wilaya_title: 'Wilaya',
        filter_wilaya_all: 'All wilayas',
        filter_category_title: 'Category',
        filter_category_all: 'All categories',
        filter_clear: 'Clear filters',
        home_categories_title: 'Categories',
        home_categories_back: 'Back',
        price_min: 'Min',
        price_max: 'Max',
        load_more: 'Load more',
        empty_title: 'No listings found',
        empty_subtitle: 'Try adjusting your filters or search.',
        reset_filters: 'Reset filters',
        messages_search_placeholder: 'Search',
        chat_write_message_placeholder: 'Write a message...',
        edit_profile_title: 'Edit profile',
        label_name: 'Name',
        label_username: 'Username',
        label_location: 'Location',
        label_account_type: 'Account type',
        label_phone: 'Phone number',
        label_work_category: 'Work category',
        save_changes: 'Save changes',
        category_search_placeholder: 'Search a category...',
        select_search_placeholder: 'Search...',
        theme_dark_mode: 'Dark mode',
        sidebar_categories: 'Categories',
        cat_all: 'All',
        cat_vehicles: 'Vehicles',
        cat_real_estate: 'Real Estate',
        cat_electronics: 'Electronics',
        cat_jobs_services: 'Jobs & Services',
        cat_home_garden: 'Home & Garden',
        cat_fashion_beauty: 'Fashion & Beauty',
        cat_leisure_entertainment: 'Leisure & Entertainment',
        cat_it: 'IT',
        cat_telephony: 'Phones',
        cat_sport_health: 'Sports & Health',
        cat_pro_equipment: 'Pro Equipment',
        cat_other: 'Other',
        sidebar_following: 'Following',
        sidebar_see_all: 'See all',
        sidebar_community: 'Community',
        sidebar_ambassadors: 'Ambassadors',
        sidebar_my_actions: 'My actions',
        sidebar_favorites: 'Favorites',
        sidebar_messages: 'Messages',
        sidebar_become_verified: 'Become Verified',
        sidebar_become_vip: 'Become VIP',
        sidebar_settings: 'Settings',
        sidebar_courses: 'Courses'
    },
    ar: {
        lang_current: 'العربية',
        search_placeholder: 'ابحث عن الإعلانات...',
        search_clear_history: 'مسح السجل',
        home_hero_title: 'اعثر على ما تحتاجه محليًا.',
        home_hero_subtitle: 'أفضل سوق لكل شيء.',
        home_sort_newest: 'الأحدث',
        home_sort_price_asc: 'السعر: من الأقل إلى الأعلى',
        home_sort_price_desc: 'السعر: من الأعلى إلى الأقل',
        filter_button: 'فلاتر',
        filter_price_title: 'السعر (دج)',
        filter_wilaya_title: 'الولاية',
        filter_wilaya_all: 'كل الولايات',
        filter_category_title: 'الفئة',
        filter_category_all: 'كل الفئات',
        filter_clear: 'مسح الفلاتر',
        home_categories_title: 'الفئات',
        home_categories_back: 'رجوع',
        price_min: 'الأدنى',
        price_max: 'الأقصى',
        load_more: 'تحميل المزيد',
        empty_title: 'لا توجد إعلانات',
        empty_subtitle: 'جرّب تعديل الفلاتر أو البحث.',
        reset_filters: 'إعادة تعيين الفلاتر',
        messages_search_placeholder: 'بحث',
        chat_write_message_placeholder: 'اكتب رسالة...',
        edit_profile_title: 'تعديل الملف الشخصي',
        label_name: 'الاسم',
        label_username: 'اسم المستخدم',
        label_location: 'الموقع',
        label_account_type: 'نوع الحساب',
        label_phone: 'رقم الهاتف',
        label_work_category: 'فئة النشاط',
        save_changes: 'حفظ التغييرات',
        category_search_placeholder: 'ابحث عن فئة...',
        select_search_placeholder: 'بحث...',
        theme_dark_mode: 'الوضع الداكن',
        sidebar_categories: 'الفئات',
        cat_all: 'الكل',
        cat_vehicles: 'مركبات',
        cat_real_estate: 'عقارات',
        cat_electronics: 'إلكترونيات',
        cat_jobs_services: 'وظائف وخدمات',
        cat_home_garden: 'المنزل والحديقة',
        cat_fashion_beauty: 'الموضة والجمال',
        cat_leisure_entertainment: 'ترفيه وهوايات',
        cat_it: 'معلوماتية',
        cat_telephony: 'هواتف',
        cat_sport_health: 'الرياضة والصحة',
        cat_pro_equipment: 'معدات مهنية',
        cat_other: 'أخرى',
        sidebar_following: 'المتابَعون',
        sidebar_see_all: 'عرض الكل',
        sidebar_community: 'المجتمع',
        sidebar_ambassadors: 'سفراء',
        sidebar_my_actions: 'إجراءاتي',
        sidebar_favorites: 'المفضلة',
        sidebar_messages: 'الرسائل',
        sidebar_become_verified: 'احصل على توثيق',
        sidebar_become_vip: 'كن VIP',
        sidebar_settings: 'الإعدادات',
        sidebar_courses: 'الدورات'
    }
};

function normalizeLang(lang) {
    const l = String(lang || '').trim().toLowerCase();
    if (SUPPORTED_LANGS.includes(l)) return l;
    return 'fr';
}

function t(key) {
    const k = String(key || '').trim();
    if (!k) return '';
    const dict = I18N[currentLang] || I18N.fr;
    return dict[k] ?? I18N.fr[k] ?? k;
}

function setLanguage(lang) {
    currentLang = normalizeLang(lang);
    try {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, currentLang);
    } catch (e) {
        null;
    }
    applyLanguageToDocument();
    applyTranslations();
    applyBusinessTypeTranslations();
    populateWorkCategoriesSelect();
    renderHomeCategorySwipe();
}

function applyLanguageToDocument() {
    const isRtl = currentLang === 'ar';
    document.documentElement.lang = currentLang;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
}

function applyTranslations() {
    const nodes = translationsCached && Array.isArray(cachedI18nNodes) && cachedI18nNodes.length
        ? cachedI18nNodes
        : Array.from(document.querySelectorAll('[data-i18n]'));
    nodes.forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (!key) return;
        el.textContent = t(key);
    });
    const placeholderNodes = translationsCached && Array.isArray(cachedI18nPlaceholderNodes) && cachedI18nPlaceholderNodes.length
        ? cachedI18nPlaceholderNodes
        : Array.from(document.querySelectorAll('[data-i18n-placeholder]'));
    placeholderNodes.forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (!key) return;
        el.setAttribute('placeholder', t(key));
    });

    if (translationsCached) {
        try {
            const activeSectionId = typeof getActiveSectionId === 'function' ? getActiveSectionId() : '';
            const root = activeSectionId ? document.getElementById(activeSectionId) : null;
            if (root) {
                root.querySelectorAll('[data-i18n]').forEach((el) => {
                    const key = el.getAttribute('data-i18n');
                    if (!key) return;
                    el.textContent = t(key);
                });
                root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
                    const key = el.getAttribute('data-i18n-placeholder');
                    if (!key) return;
                    el.setAttribute('placeholder', t(key));
                });
            }
        } catch (e) {
            null;
        }
    }

    const langLabel = document.querySelector('#sidebarLang .sidebar-lang-label[data-i18n="lang_current"]');
    if (langLabel) langLabel.textContent = t('lang_current');
}

function cacheTranslationNodes() {
    try {
        cachedI18nNodes = Array.from(document.querySelectorAll('[data-i18n]'));
        cachedI18nPlaceholderNodes = Array.from(document.querySelectorAll('[data-i18n-placeholder]'));
        translationsCached = true;
    } catch (e) {
        translationsCached = false;
        cachedI18nNodes = [];
        cachedI18nPlaceholderNodes = [];
    }
}

function initLanguageSelector() {
    const wrap = document.getElementById('sidebarLang');
    const btn = document.getElementById('sidebarLangBtn');
    const menu = document.getElementById('sidebarLangMenu');
    if (!wrap || !btn || !menu) return;

    const close = () => {
        wrap.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
    };

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !wrap.classList.contains('open');
        wrap.classList.toggle('open', next);
        btn.setAttribute('aria-expanded', next ? 'true' : 'false');
    });

    menu.querySelectorAll('[data-lang]').forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const lang = item.getAttribute('data-lang');
            close();
            setLanguage(lang);
        });
    });

    document.addEventListener('click', () => close());
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
    });
}

function initLanguage() {
    let lang = 'fr';
    try {
        lang = localStorage.getItem(LANGUAGE_STORAGE_KEY) || '';
    } catch (e) {
        lang = '';
    }
    if (!lang) {
        const nav = String(navigator.language || '').toLowerCase();
        if (nav.startsWith('ar')) lang = 'ar';
        else if (nav.startsWith('en')) lang = 'en';
        else lang = 'fr';
    }
    currentLang = normalizeLang(lang);
    applyLanguageToDocument();
    initLanguageSelector();
    applyTranslations();
    applyBusinessTypeTranslations();
    populateWorkCategoriesSelect();
}

function applyBusinessTypeTranslations() {
    const map = {
        Particulier: { fr: 'Particulier', en: 'Individual', ar: 'فردي' },
        Professionnel: { fr: 'Professionnel', en: 'Professional', ar: 'مهني' }
    };
    ['editBusinessType', 'businessType', 'signupBusinessType'].forEach((id) => {
        const sel = document.getElementById(id);
        if (!sel) return;
        Array.from(sel.options || []).forEach((opt) => {
            const v = String(opt.value || '').trim();
            if (!map[v]) return;
            opt.textContent = map[v][currentLang] || map[v].fr;
        });
    });
}

function safeStorageFilename(name) {
    return String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
}

function getListingVideoMeta(item) {
    const d = item?.details && typeof item.details === 'object' ? item.details : {};
    const url = String(d.video_url || '').trim();
    const path = String(d.video_path || '').trim();
    const poster = String(d.video_poster_url || '').trim();
    return {
        url,
        path,
        poster,
        hasVideo: !!(url || path)
    };
}

function hasListingVideo(item) {
    return getListingVideoMeta(item).hasVideo;
}

function normalizeSupabaseProjectUrl(url) {
    if (typeof url !== 'string') return '';
    const trimmed = url.trim().replace(/\/+$/, '');
    return trimmed
        .replace(/\/rest\/v1$/i, '')
        .replace(/\/auth\/v1$/i, '')
        .replace(/\/storage\/v1$/i, '')
        .replace(/\/functions\/v1$/i, '');
}

function getSupabaseProjectRef(url) {
    try {
        const u = new URL(url);
        const host = u.hostname || '';
        if (!host.endsWith('.supabase.co')) return '';
        return host.split('.')[0] || '';
    } catch (e) {
        return '';
    }
}

const SUPABASE_PROJECT_URL = normalizeSupabaseProjectUrl('https://rxlpesdvskyytbfoufvp.supabase.co/rest/v1/');
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ4bHBlc2R2c2t5eXRiZm91ZnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4ODkwNDksImV4cCI6MjA5MjQ2NTA0OX0.esek-Q3uxOvm27NNxvvsznUtC3-hZ6hsRwhMchWyasM';
const SUPABASE_PROJECT_REF = getSupabaseProjectRef(SUPABASE_PROJECT_URL);

function getRememberMeEnabled() {
    try {
        return localStorage.getItem('winjayRememberMe') === 'true';
    } catch (e) {
        return false;
    }
}

const supabaseAuthStorage = {
    getItem: (key) => {
        try {
            const storage = getRememberMeEnabled() ? localStorage : sessionStorage;
            return storage.getItem(key);
        } catch (e) {
            return null;
        }
    },
    setItem: (key, value) => {
        try {
            const storage = getRememberMeEnabled() ? localStorage : sessionStorage;
            storage.setItem(key, value);
        } catch (e) {
            null;
        }
    },
    removeItem: (key) => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            null;
        }
        try {
            sessionStorage.removeItem(key);
        } catch (e) {
            null;
        }
    }
};

let supabaseClient = null;
let currentSupabaseUserId = null;
let currentSupabaseUserEmail = '';
let myReferralCount = 0;
let hasLoadedSupabaseProfile = false;
let hasLoadedIdentityStatus = false;
let myIdentityStatus = null;

let coursesFeatureEnabledFlag = true;
let coursesFeatureFlagsLoaded = false;
let liveSocialShoppingFeatureEnabledFlag = false;
let liveSocialShoppingFeatureFlagsLoaded = false;
let liveSocialShoppingState = {
    activeCollection: 'featured',
    cart: {}
};
let deletedAccountLogoutActive = false;

let listingsLoadedCount = 0;
let listingsHasMore = true;
let listingsLoadMoreBound = false;
let lucideRenderTimer = null;
let lucidePendingRoots = new Set();
let marketplaceRenderTimer = null;
let lastCarouselSwipeAt = 0;
let homeInitialListingsLoading = true;
let homeInitialListingsLoaded = false;
let translationsCached = false;
let cachedI18nNodes = [];
let cachedI18nPlaceholderNodes = [];
let marketplaceListingsSaveTimer = null;
let marketplaceListingsSaveQueued = false;

function scheduleLucideCreateIcons(rootEl = null) {
    if (document.visibilityState !== 'visible') return;
    try {
        const root = rootEl && rootEl instanceof Element ? rootEl : null;
        if (root) lucidePendingRoots.add(root);
        else lucidePendingRoots.add(document.body);
    } catch (e) {
        null;
    }
    if (lucideRenderTimer) {
        return;
    }
    lucideRenderTimer = setTimeout(() => {
        lucideRenderTimer = null;
        try {
            const roots = Array.from(lucidePendingRoots || []);
            lucidePendingRoots = new Set();
            if (typeof lucide?.createIcons !== 'function') return;
            for (const r of roots) {
                const root = r && r instanceof Element ? r : null;
                if (!root) continue;
                lucide.createIcons({ root });
            }
        } catch (e) {
            null;
        }
    }, 50);
}

function scheduleMarketplaceRenders(flags = undefined) {
    if (document.visibilityState !== 'visible') return;
    if (marketplaceRenderTimer) {
        try {
            clearTimeout(marketplaceRenderTimer);
        } catch (e) {
            null;
        }
    }
    marketplaceRenderTimer = setTimeout(() => {
        marketplaceRenderTimer = null;
        const opts = flags && typeof flags === 'object' ? flags : null;
        const doAll = !opts;

        const doSync = doAll || !!opts.syncMyListings;
        const doListings = doAll || !!opts.listings;
        const doMyListings = doAll || !!opts.myListings;
        const doFavorites = doAll || !!opts.favorites;
        const doLoadMoreUi = doAll || !!opts.loadMoreUI;

        if (doSync) {
            try {
                syncMyListingsFromListings();
            } catch (e) {
                null;
            }
        }
        if (doListings) {
            try {
                renderListings();
            } catch (e) {
                null;
            }
        }
        if (doMyListings) {
            try {
                renderMyListings();
            } catch (e) {
                null;
            }
        }
        if (doFavorites) {
            try {
                renderFavorites();
            } catch (e) {
                null;
            }
        }
        if (doLoadMoreUi) {
            try {
                updateLoadMoreListingsUI();
            } catch (e) {
                null;
            }
        }

        const rootEl = opts?.iconsRoot instanceof Element ? opts.iconsRoot : null;
        scheduleLucideCreateIcons(rootEl);
    }, 50);
}

function endBootUI() {
    try {
        if (window.__winjayBootTimer) {
            clearTimeout(window.__winjayBootTimer);
            window.__winjayBootTimer = null;
        }
    } catch (e) {
        null;
    }
    try {
        document.documentElement.classList.remove('app-booting');
    } catch (e) {
        null;
    }
    try {
        delete document.documentElement.dataset.initialSection;
    } catch (e) {
        null;
    }
    try {
        const activeSection = getActiveSectionId();
        document.documentElement.classList.toggle('listing-detail-view', activeSection === 'listing-detail-section');
        document.documentElement.classList.toggle('admin-dashboard-view', activeSection === 'admin-dashboard-section');
    } catch (e) {
        null;
    }
    try {
        if (getActiveSectionId() === 'admin-dashboard-section') {
            setSidebarMobileOpen(false);
        }
    } catch (e) {
        null;
    }
}

function startSectionLoadingSkeleton(sectionId) {
    const id = String(sectionId || '').trim() || 'home-section';
    try {
        document.documentElement.classList.add('section-loading');
        document.documentElement.dataset.skeletonView = id;
    } catch (e) {
        null;
    }
}

function stopSectionLoadingSkeleton() {
    try {
        document.documentElement.classList.remove('section-loading');
    } catch (e) {
        null;
    }
    try {
        delete document.documentElement.dataset.skeletonView;
    } catch (e) {
        null;
    }
}

function setInnerHTMLIfEmpty(el, html) {
    if (!el) return;
    const current = String(el.innerHTML || '').trim();
    if (current) return;
    el.innerHTML = html;
}

function updateLoadMoreListingsUI() {
    const wrap = document.getElementById('loadMoreListingsWrap');
    const btn = document.getElementById('loadMoreListingsBtn');
    if (!wrap || !btn) return;
    const show = !DEMO_MODE && !!listingsHasMore && getActiveSectionId() === 'home-section' && homeInitialListingsLoaded && listingsLoadedCount > 0;
    wrap.style.display = show ? 'flex' : 'none';
}

let listingsInfiniteObserver = null;
let listingsLoadMoreInFlight = false;
let listingsInfiniteLastTriggerAt = 0;

function setupInfiniteListingsLoad() {
    if (listingsInfiniteObserver) return;
    const wrap = document.getElementById('loadMoreListingsWrap');
    if (!wrap) return;
    try {
        listingsInfiniteObserver = new IntersectionObserver((entries) => {
            const entry = entries && entries[0];
            if (!entry || !entry.isIntersecting) return;
            const show = !DEMO_MODE && !!listingsHasMore && getActiveSectionId() === 'home-section' && homeInitialListingsLoaded && listingsLoadedCount > 0;
            if (!show) return;
            if (listingsLoadMoreInFlight) return;
            const btn = document.getElementById('loadMoreListingsBtn');
            if (!btn || btn.disabled) return;
            const now = Date.now();
            if (now - listingsInfiniteLastTriggerAt < 900) return;
            listingsInfiniteLastTriggerAt = now;
            btn.click();
        }, { root: null, rootMargin: '650px 0px', threshold: 0 });
        listingsInfiniteObserver.observe(wrap);
    } catch (e) {
        listingsInfiniteObserver = null;
    }
}

function isLoggedIn() {
    return !!currentSupabaseUserId;
}

function isCoursesFeatureEnabledForViewer() {
    return !!coursesFeatureEnabledFlag || !!userProfile?.isAdmin;
}

function isLiveSocialShoppingEnabledForViewer() {
    return !!liveSocialShoppingFeatureEnabledFlag || !!userProfile?.isAdmin;
}

function applyCoursesFeatureVisibility() {
    const allow = isCoursesFeatureEnabledForViewer();
    const loggedIn = isLoggedIn();
    const sidebarCoursesItem = document.getElementById('sidebarCoursesItem');
    if (sidebarCoursesItem) sidebarCoursesItem.style.display = loggedIn && allow ? '' : 'none';

    const myCoursesTab = document.getElementById('myProfileCoursesTab');
    const myCoursesPanel = document.getElementById('myProfileCoursesSection');
    if (myCoursesTab) myCoursesTab.style.display = loggedIn && allow ? '' : 'none';
    if (!allow) {
        if (myCoursesPanel) myCoursesPanel.classList.remove('active');
        const listingsTab = document.getElementById('myProfileListingsTab');
        const listingsPanel = document.getElementById('myProfileListingsSection');
        if (listingsTab) listingsTab.classList.add('active');
        if (listingsPanel) listingsPanel.classList.add('active');
    }

    const sellerCoursesTab = document.getElementById('sellerCoursesTab');
    const sellerCoursesPanel = document.getElementById('sellerCoursesSection');
    if (sellerCoursesTab) sellerCoursesTab.style.display = allow ? '' : 'none';
    if (!allow && sellerCoursesPanel) sellerCoursesPanel.classList.remove('active');
}

function applyLiveSocialShoppingFeatureVisibility() {
    const allow = isLiveSocialShoppingEnabledForViewer();
    const sidebarLiveSocialShoppingItem = document.getElementById('sidebarLiveSocialShoppingItem');
    if (sidebarLiveSocialShoppingItem) sidebarLiveSocialShoppingItem.style.display = allow ? '' : 'none';
}

async function refreshCoursesFeatureFlag({ silent = false } = {}) {
    const client = initSupabase();
    if (!client) {
        coursesFeatureEnabledFlag = true;
        coursesFeatureFlagsLoaded = true;
        applyCoursesFeatureVisibility();
        return coursesFeatureEnabledFlag;
    }
    try {
        const { data, error } = await client.from('feature_flags').select('enabled').eq('key', 'courses_enabled').maybeSingle();
        if (error) throw error;
        if (data && typeof data.enabled === 'boolean') coursesFeatureEnabledFlag = data.enabled;
        coursesFeatureFlagsLoaded = true;
        applyCoursesFeatureVisibility();
        return coursesFeatureEnabledFlag;
    } catch (e) {
        coursesFeatureEnabledFlag = true;
        coursesFeatureFlagsLoaded = true;
        applyCoursesFeatureVisibility();
        if (!silent) null;
        return coursesFeatureEnabledFlag;
    }
}

async function refreshLiveSocialShoppingFeatureFlag({ silent = false } = {}) {
    const client = initSupabase();
    if (!client) {
        liveSocialShoppingFeatureEnabledFlag = false;
        liveSocialShoppingFeatureFlagsLoaded = true;
        applyLiveSocialShoppingFeatureVisibility();
        return liveSocialShoppingFeatureEnabledFlag;
    }
    try {
        const { data, error } = await client.from('feature_flags').select('enabled').eq('key', 'live_social_shopping_enabled').maybeSingle();
        if (error) throw error;
        liveSocialShoppingFeatureEnabledFlag = !!data?.enabled;
        liveSocialShoppingFeatureFlagsLoaded = true;
        applyLiveSocialShoppingFeatureVisibility();
        return liveSocialShoppingFeatureEnabledFlag;
    } catch (e) {
        liveSocialShoppingFeatureEnabledFlag = false;
        liveSocialShoppingFeatureFlagsLoaded = true;
        applyLiveSocialShoppingFeatureVisibility();
        if (!silent) null;
        return liveSocialShoppingFeatureEnabledFlag;
    }
}

function requireAuthOrPrompt() {
    if (isLoggedIn()) return true;
    showToast('Please log in to continue', 'log-in');
    openModal('loginModal');
    return false;
}

async function forceVisitorLogout({ message = 'Account disabled', silent = false } = {}) {
    if (deletedAccountLogoutActive) return;
    deletedAccountLogoutActive = true;
    try {
        setChatRouteParam(false, { replace: true });
    } catch (e) {
        null;
    }
    try {
        setCourseRouteParam('', { replace: true });
    } catch (e) {
        null;
    }
    try {
        clearSellerProfileRouteTag();
    } catch (e) {
        null;
    }
    try {
        clearListingRouteParams({ replace: true });
    } catch (e) {
        null;
    }
    try {
        showSection('home-section');
    } catch (e) {
        null;
    }
    if (!silent) showToast(message, 'alert-circle');
    try {
        const client = initSupabase();
        await client?.auth?.signOut?.();
    } catch (e) {
        null;
    }
    try {
        applyAuthSessionToLocalState(null);
    } catch (e) {
        null;
    }
    deletedAccountLogoutActive = false;
}

async function requireValidSessionOrPrompt(client) {
    const c = client || initSupabase();
    if (!c) return null;
    try {
        const { data, error } = await c.auth.getSession();
        let session = data?.session || null;
        if (!error && session?.expires_at) {
            const expiresAtMs = Number(session.expires_at) * 1000;
            const shouldRefresh = Number.isFinite(expiresAtMs) && expiresAtMs <= Date.now() + 30_000;
            if (shouldRefresh) {
                const refreshed = await c.auth.refreshSession();
                session = refreshed?.data?.session || session;
            }
        }
        const { data: userData, error: userErr } = await c.auth.getUser();
        const user = userData?.user || null;
        if (error || userErr || !session?.access_token || !user?.id) {
            applyAuthSessionToLocalState(null);
            showToast('Session expired, log in again', 'alert-circle');
            openModal('loginModal');
            return null;
        }
        const incomingId = String(user.id || '');
        if (!incomingId || String(currentSupabaseUserId || '') !== incomingId) applyAuthSessionToLocalState(session);
        return session;
    } catch (e) {
        applyAuthSessionToLocalState(null);
        showToast('Session expired, log in again', 'alert-circle');
        openModal('loginModal');
        return null;
    }
}

function formatRelativeDate(value) {
    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return '';
        const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
    } catch (e) {
        return '';
    }
}

function buildSellerPlaceholder(ownerId) {
    const id = String(ownerId || '');
    const short = id ? id.slice(0, 8) : 'user';
    return {
        name: 'Seller',
        tag: `@${short}`,
        pic: DEFAULT_AVATAR_SVG,
        verified: false,
        rating: 0,
        reviews: 0,
        reviewsData: []
    };
}

function pickFirstValue(obj, keys) {
    if (!obj || typeof obj !== 'object') return '';
    for (const k of keys) {
        const v = obj[k];
        if (typeof v === 'string' && v.trim()) return v.trim();
    }
    return '';
}

function isAutoGeneratedTag(tag) {
    const t = String(tag || '').trim();
    return /^@[0-9a-f]{8}$/i.test(t);
}

const CATEGORY_ALIASES = {
    "Véhicules": "Automobiles & Véhicules",
    "Motos & Vélos": "Automobiles & Véhicules",
    "Pièces & Accessoires": "Pièces détachées",
    "Pièces de rechange": "Pièces détachées",
    "Téléphonie": "Téléphones & Accessoires",
    "Électronique": "Électroménager & Électronique",
    "Électroménager": "Électroménager & Électronique",
    "Maison & Jardin": "Meubles & Maison",
    "Mode & Beauté": "Vêtements & Mode",
    "Sport & Santé": "Sport",
    "Loisirs & Divertissement": "Loisirs & Divertissements",
    "Matériel Professionnel": "Matériaux & Équipement",
    "Emploi & Services": "Services",
    "Autres": "Services"
};

function normalizeListingCategory(category, subcategory = '') {
    const cat = String(category || '').trim();
    const sub = String(subcategory || '').trim().toLowerCase();
    if (!cat) return '';
    if (cat === 'Emploi & Services') {
        if (sub.includes('emploi')) return 'Emploi';
        if (sub.includes('stage')) return 'Emploi';
        if (sub.includes('intérim') || sub.includes('interim')) return 'Emploi';
        return 'Services';
    }
    return CATEGORY_ALIASES[cat] || cat;
}

const NORMALIZED_CATEGORY_TO_RAW = (() => {
    const map = {};
    Object.entries(CATEGORY_ALIASES).forEach(([raw, normalized]) => {
        if (!map[normalized]) map[normalized] = new Set();
        map[normalized].add(raw);
    });
    return map;
})();

function getRawCategoriesForNormalizedCategory(category) {
    const c = String(category || '').trim();
    if (!c) return [];
    const set = NORMALIZED_CATEGORY_TO_RAW[c];
    const raw = set ? Array.from(set.values()) : [];
    if (!raw.includes(c)) raw.unshift(c);
    if (c === 'Emploi' || c === 'Services') {
        if (!raw.includes('Emploi & Services')) raw.push('Emploi & Services');
    }
    return raw;
}

function sanitizePostgrestSearchTerm(term) {
    const raw = String(term || '').toLowerCase().trim();
    if (!raw) return '';
    return raw
        .replace(/[%_]/g, ' ')
        .replace(/[(),]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 80);
}

function mapSupabaseListingRow(row, profilesById = {}) {
    const images = Array.isArray(row?.listing_images) ? row.listing_images.slice() : [];
    images.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
    const firstUrl = images[0]?.url || '';
    const firstThumb = images[0]?.thumbnail_url || '';
    const ownerId = row?.owner_id || null;
    const embeddedProfile = row?.profiles && typeof row.profiles === 'object' ? row.profiles : null;
    const profileRow = embeddedProfile || (ownerId ? profilesById[ownerId] || null : null);
    const sellerFromProfile = profileRow ? mapProfileRowToSeller(profileRow) : buildSellerPlaceholder(ownerId);

    const rawCategory = row.category || '';
    const rawSubcategory = row.subcategory || '';
    const normalizedCategory = normalizeListingCategory(rawCategory, rawSubcategory);
    return {
        id: Number(row.id),
        owner_id: ownerId,
        title: row.title,
        description: row.description || '',
        subcategory: rawSubcategory || '',
        price: Number(row.price) || 0,
        price_type: row.price_type || '',
        condition: row.condition || '',
        delivery: row.delivery || '',
        availability: row.availability || 'Available',
        category: normalizedCategory,
        image: firstUrl || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=500',
        images: images.map((x) => x.url).filter(Boolean),
        cardImage: firstThumb || firstUrl || '',
        cardImages: images.map((x) => x.thumbnail_url || x.url).filter(Boolean),
        listing_images_meta: images.map((x) => ({ url: x.url, thumbnail_url: x.thumbnail_url || '', sort_order: x.sort_order })),
        city: row.city || '',
        contact_phone: row.contact_phone || '',
        tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
        details: row.details && typeof row.details === 'object' ? row.details : {},
        location: row.city ? `${row.city}, ${row.wilaya || ''}`.replace(/,\s*$/, '') : (row.wilaya || ''),
        wilaya: row.wilaya || '',
        status: row.status || 'active',
        created_at: row.created_at,
        date: formatRelativeDate(row.created_at),
        seller: sellerFromProfile,
        views_count: Number(row.views_count) || 0,
        likes_count: Number(row.likes_count) || 0,
        reviewsData: []
    };
}

let listingsActiveServerFiltersKey = '';
let listingsRefetchTimer = null;
let listingsNextCursor = null;
let vipVideoListings = [];
let vipVideoListingsLoading = false;
let vipVideoListingsActiveKey = '';
let vipVerifiedHomeListings = [];
let vipVerifiedHomeLoading = false;
let vipVerifiedHomeHasMore = false;
let vipVerifiedHomeKey = '';
let vipVerifiedPageListings = [];
let vipVerifiedPageLoading = false;
let vipVerifiedPageHasMore = false;
let vipVerifiedPageNextCursor = null;
let vipVerifiedPageKey = '';
const VIP_VERIFIED_VIEW = 'listings_with_seller_flags';

function buildListingsServerFiltersKey(filters) {
    const f = filters && typeof filters === 'object' ? filters : {};
    return JSON.stringify({
        search: String(f.search || '').trim().toLowerCase(),
        category: String(f.category || '').trim(),
        subcategory: String(f.subcategory || '').trim(),
        wilaya: String(f.wilaya || '').trim(),
        priceMin: String(f.priceMin || '').trim(),
        priceMax: String(f.priceMax || '').trim(),
        sort: String(f.sort || 'newest').trim()
    });
}

function applyServerFiltersToListingsQuery(q, filters) {
    const f = filters && typeof filters === 'object' ? filters : {};
    const search = sanitizePostgrestSearchTerm(f.search);
    if (search) {
        q = q.or(`title.ilike.%${search}%,description.ilike.%${search}%,category.ilike.%${search}%`);
    }
    if (f.category) {
        const rawCats = getRawCategoriesForNormalizedCategory(f.category);
        if (rawCats.length === 1) {
            q = q.eq('category', rawCats[0]);
        } else if (rawCats.length > 1) {
            q = q.in('category', rawCats);
        }
    }
    if (f.subcategory) q = q.eq('subcategory', String(f.subcategory));
    if (f.wilaya) q = q.eq('wilaya', String(f.wilaya));
    if (f.priceMin) {
        const min = Number.parseInt(String(f.priceMin), 10);
        if (Number.isFinite(min)) q = q.gte('price', min);
    }
    if (f.priceMax) {
        const max = Number.parseInt(String(f.priceMax), 10);
        if (Number.isFinite(max)) q = q.lte('price', max);
    }
    const sort = String(f.sort || 'newest');
    if (sort === 'price-asc') {
        q = q.order('price', { ascending: true, nullsFirst: false });
        q = q.order('created_at', { ascending: false });
        q = q.order('id', { ascending: false });
    } else if (sort === 'price-desc') {
        q = q.order('price', { ascending: false, nullsFirst: false });
        q = q.order('created_at', { ascending: false });
        q = q.order('id', { ascending: false });
    } else {
        q = q.order('created_at', { ascending: false });
        q = q.order('id', { ascending: false });
    }
    return q;
}

function applyKeysetCursorToListingsQuery(q, cursor, filters) {
    const c = cursor && typeof cursor === 'object' ? cursor : null;
    if (!c) return q;
    const sort = String(filters?.sort || 'newest');
    const createdAt = String(c.created_at || '').trim();
    const id = Number(c.id);
    const price = Number(c.price);
    if (!createdAt || !Number.isFinite(id)) return q;
    if (sort === 'price-asc' && Number.isFinite(price)) {
        return q.or(
            `price.gt.${price},and(price.eq.${price},created_at.lt.${createdAt}),and(price.eq.${price},created_at.eq.${createdAt},id.lt.${id})`
        );
    }
    if (sort === 'price-desc' && Number.isFinite(price)) {
        return q.or(
            `price.lt.${price},and(price.eq.${price},created_at.lt.${createdAt}),and(price.eq.${price},created_at.eq.${createdAt},id.lt.${id})`
        );
    }
    return q.or(`created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`);
}

function buildListingsNextCursorFromRow(row, filters) {
    const r = row && typeof row === 'object' ? row : null;
    if (!r) return null;
    const id = Number(r.id);
    const createdAt = String(r.created_at || '').trim();
    if (!createdAt || !Number.isFinite(id)) return null;
    const cursor = { id, created_at: createdAt };
    const sort = String(filters?.sort || 'newest');
    if (sort === 'price-asc' || sort === 'price-desc') cursor.price = Number(r.price) || 0;
    return cursor;
}

function applyActiveListingsOnly(q) {
    try {
        return q.eq('status', 'active').is('deleted_at', null);
    } catch (e) {
        return q;
    }
}

function sortListingsInPlace(items, filters) {
    if (!Array.isArray(items)) return items;
    const sort = String(filters?.sort || 'newest');
    if (sort === 'price-asc') {
        items.sort((a, b) => {
            const pa = Number(a?.price) || 0;
            const pb = Number(b?.price) || 0;
            if (pa !== pb) return pa - pb;
            const ta = new Date(a?.created_at || 0).getTime();
            const tb = new Date(b?.created_at || 0).getTime();
            if (tb !== ta) return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
            return (Number(b?.id) || 0) - (Number(a?.id) || 0);
        });
        return items;
    }
    if (sort === 'price-desc') {
        items.sort((a, b) => {
            const pa = Number(a?.price) || 0;
            const pb = Number(b?.price) || 0;
            if (pa !== pb) return pb - pa;
            const ta = new Date(a?.created_at || 0).getTime();
            const tb = new Date(b?.created_at || 0).getTime();
            if (tb !== ta) return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
            return (Number(b?.id) || 0) - (Number(a?.id) || 0);
        });
        return items;
    }
    items.sort((a, b) => {
        const ta = new Date(a?.created_at || 0).getTime();
        const tb = new Date(b?.created_at || 0).getTime();
        if (tb !== ta) return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
        return (Number(b?.id) || 0) - (Number(a?.id) || 0);
    });
    return items;
}

function buildVipVideoListingsFiltersKey(filters) {
    const f = filters && typeof filters === 'object' ? filters : {};
    return JSON.stringify({
        search: String(f.search || '').trim().toLowerCase(),
        category: String(f.category || '').trim(),
        subcategory: String(f.subcategory || '').trim(),
        wilaya: String(f.wilaya || '').trim(),
        priceMin: String(f.priceMin || '').trim(),
        priceMax: String(f.priceMax || '').trim()
    });
}

function buildVipVerifiedFiltersKey(filters) {
    const f = filters && typeof filters === 'object' ? filters : {};
    return JSON.stringify({
        search: String(f.search || '').trim().toLowerCase(),
        category: String(f.category || '').trim(),
        subcategory: String(f.subcategory || '').trim(),
        wilaya: String(f.wilaya || '').trim(),
        priceMin: String(f.priceMin || '').trim(),
        priceMax: String(f.priceMax || '').trim(),
        sort: String(f.sort || 'newest').trim()
    });
}

async function fetchListingImagesMetaByListingIds(client, listingIds) {
    if (!client) return {};
    const ids = Array.isArray(listingIds) ? listingIds.map((x) => Number(x)).filter((x) => Number.isFinite(x) && x > 0) : [];
    const unique = Array.from(new Set(ids));
    if (!unique.length) return {};
    const { data, error } = await client
        .from('listing_images')
        .select('listing_id, url, thumbnail_url, sort_order')
        .in('listing_id', unique);
    if (error) return {};
    const byId = {};
    (data || []).forEach((r) => {
        const lid = Number(r?.listing_id) || 0;
        if (!lid) return;
        if (!byId[lid]) byId[lid] = [];
        byId[lid].push({
            url: r?.url || '',
            thumbnail_url: r?.thumbnail_url || '',
            sort_order: Number(r?.sort_order) || 0
        });
    });
    Object.values(byId).forEach((arr) => {
        arr.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
    });
    return byId;
}

async function fetchVipVideoListingsFromSupabase({ silent = true, includeProfiles = true, limit = 4, filters = null } = {}) {
    if (DEMO_MODE) {
        vipVideoListings = getVipVideoListingsForHome();
        vipVideoListingsLoading = false;
        renderVipVideoSection();
        return;
    }
    const client = initSupabase();
    if (!client) return;
    const safeFiltersRaw = filters && typeof filters === 'object' ? filters : (typeof currentFilters === 'object' ? currentFilters : {});
    const safeFilters = { ...safeFiltersRaw, sort: 'newest' };
    const nextKey = buildVipVideoListingsFiltersKey(safeFilters);
    if (nextKey === vipVideoListingsActiveKey && Array.isArray(vipVideoListings) && vipVideoListings.length > 0) {
        renderVipVideoSection();
        return;
    }
    vipVideoListingsLoading = true;
    renderVipVideoSection();
    const baseSelect = 'id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, listing_images(url, thumbnail_url, sort_order)';
    const embeddedSelect = `${baseSelect}, profiles(id, display_name, tag, avatar_url, verified, is_vip)`;
    const safeLimit = Math.max(1, Math.min(40, Math.max(10, (Number(limit) || 4) * 10)));
    const buildVipQuery = (selectStr) => {
        let q = client
            .from('listings')
            .select(selectStr);
        q = applyActiveListingsOnly(q);
        q = applyServerFiltersToListingsQuery(q, safeFilters);
        q = q.or('details->>video_url.not.is.null,details->>video_path.not.is.null');
        q = q.limit(safeLimit);
        return q;
    };
    let data = null;
    let error = null;
    let profilesById = {};
    {
        const q = buildVipQuery(includeProfiles ? embeddedSelect : baseSelect);
        const res = await q;
        data = res.data;
        error = res.error;
    }
    if (error && includeProfiles) {
        {
            const q = buildVipQuery(baseSelect);
            const res = await q;
            data = res.data;
            error = res.error;
        }
        const ownerIds = Array.from(new Set((data || []).map((r) => r?.owner_id).filter(Boolean)));
        profilesById = ownerIds.length ? await fetchProfilesByIds(ownerIds) : {};
    }
    vipVideoListingsLoading = false;
    if (error) {
        if (!silent) showToast(error.message || 'Failed to load VIP videos', 'alert-circle');
        vipVideoListings = [];
        vipVideoListingsActiveKey = nextKey;
        renderVipVideoSection();
        return;
    }
    const mapped = (data || []).map((row) => mapSupabaseListingRow(row, profilesById));
    const hardCap = Math.max(1, Math.min(12, Number(limit) || 4));
    let picked = mapped.filter((x) => hasListingVideo(x));
    if (picked.length === 0) {
        let fallbackQ = client
            .from('listings')
            .select(includeProfiles ? embeddedSelect : baseSelect);
        fallbackQ = applyActiveListingsOnly(fallbackQ);
        fallbackQ = applyServerFiltersToListingsQuery(fallbackQ, safeFilters);
        fallbackQ = fallbackQ.limit(Math.max(20, Math.min(80, hardCap * 20)));
        const fallbackRes = await fallbackQ;
        const fallbackData = fallbackRes.data;
        const fallbackError = fallbackRes.error;
        if (fallbackError) {
            if (!silent) showToast(fallbackError.message || 'Failed to load VIP videos', 'alert-circle');
        } else {
            const fallbackMapped = (fallbackData || []).map((row) => mapSupabaseListingRow(row, {}));
            picked = fallbackMapped.filter((x) => hasListingVideo(x));
        }
    }
    vipVideoListings = picked.slice(0, hardCap);
    vipVideoListingsActiveKey = nextKey;
    renderVipVideoSection();
}

async function fetchVipVerifiedHomeFromSupabase({ silent = true, includeProfiles = true, limit = 4, filters = null } = {}) {
    if (DEMO_MODE) {
        const allFiltered = getFilteredListings().filter((l) => !hasListingVideo(l));
        const items = allFiltered.filter((l) => isVipOrVerifiedSeller(l));
        vipVerifiedHomeListings = items.slice(0, 4);
        vipVerifiedHomeHasMore = items.length > 4;
        vipVerifiedHomeLoading = false;
        renderListings();
        return;
    }
    const client = initSupabase();
    if (!client) return;
    const safeFilters = filters && typeof filters === 'object' ? filters : (typeof currentFilters === 'object' ? currentFilters : {});
    const nextKey = buildVipVerifiedFiltersKey(safeFilters);
    if (nextKey === vipVerifiedHomeKey && Array.isArray(vipVerifiedHomeListings) && vipVerifiedHomeListings.length > 0) {
        renderListings();
        return;
    }
    vipVerifiedHomeLoading = true;
    vipVerifiedHomeHasMore = false;
    vipVerifiedHomeKey = nextKey;

    const hardCap = Math.max(1, Math.min(12, Number(limit) || 4));
    const fetchLimit = Math.max(20, Math.min(80, hardCap * 20));

    let data = null;
    let error = null;
    {
        let q = client
            .from(VIP_VERIFIED_VIEW)
            .select('id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, seller_is_vip, seller_verified');
        q = applyActiveListingsOnly(q);
        q = applyServerFiltersToListingsQuery(q, safeFilters);
        q = q.or('seller_is_vip.eq.true,seller_verified.eq.true');
        q = q.limit(fetchLimit);
        const res = await q;
        data = res.data;
        error = res.error;
    }
    vipVerifiedHomeLoading = false;
    if (error) {
        if (!silent) showToast(error.message || 'Failed to load VIP listings', 'alert-circle');
        vipVerifiedHomeListings = [];
        vipVerifiedHomeHasMore = false;
        renderListings();
        return;
    }
    const listingIds = (data || []).map((r) => Number(r?.id) || 0).filter((x) => x > 0);
    const imagesByListingId = await fetchListingImagesMetaByListingIds(client, listingIds);
    const ownerIds = Array.from(new Set((data || []).map((r) => r?.owner_id).filter(Boolean)));
    const profilesById = ownerIds.length ? await fetchProfilesByIds(ownerIds) : {};
    const mapped = (data || []).map((row) => mapSupabaseListingRow({ ...row, listing_images: imagesByListingId[Number(row?.id) || 0] || [] }, profilesById));
    const picked = mapped
        .filter((x) => !hasListingVideo(x))
        .filter((x) => isVipOrVerifiedSeller(x));
    vipVerifiedHomeListings = picked.slice(0, hardCap);
    vipVerifiedHomeHasMore = picked.length > hardCap;
    renderListings();
}

function ensureHomeVipRowsHydrated({ silent = true, filters = null } = {}) {
    if (DEMO_MODE) return;
    if (getActiveSectionId() !== 'home-section') return;
    const safeFilters = filters && typeof filters === 'object' ? filters : (typeof currentFilters === 'object' ? currentFilters : {});
    if (!vipVideoListingsLoading) {
        void fetchVipVideoListingsFromSupabase({ silent: true, includeProfiles: true, limit: 4, filters: safeFilters });
    }
    if (!vipVerifiedHomeLoading) {
        void fetchVipVerifiedHomeFromSupabase({ silent: true, includeProfiles: true, limit: 4, filters: safeFilters });
    }
}

async function fetchVipVerifiedPageFromSupabase({ silent = true, includeProfiles = true, limit = 24, cursor = null, reset = false, filters = null } = {}) {
    if (DEMO_MODE) {
        renderVipVerifiedListingsPage();
        return;
    }
    const client = initSupabase();
    if (!client) return;
    const safeFilters = filters && typeof filters === 'object' ? filters : (typeof currentFilters === 'object' ? currentFilters : {});
    const nextKey = buildVipVerifiedFiltersKey(safeFilters);
    const hardLimit = Math.max(6, Math.min(60, Number(limit) || 24));
    if (reset || nextKey !== vipVerifiedPageKey) {
        vipVerifiedPageKey = nextKey;
        vipVerifiedPageListings = [];
        vipVerifiedPageHasMore = false;
        vipVerifiedPageNextCursor = null;
    }
    if (!reset && vipVerifiedPageLoading) return;
    vipVerifiedPageLoading = true;
    let data = null;
    let error = null;
    {
        let q = client
            .from(VIP_VERIFIED_VIEW)
            .select('id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, seller_is_vip, seller_verified');
        q = applyActiveListingsOnly(q);
        q = applyServerFiltersToListingsQuery(q, safeFilters);
        q = applyKeysetCursorToListingsQuery(q, cursor, safeFilters);
        q = q.or('seller_is_vip.eq.true,seller_verified.eq.true');
        q = q.limit(hardLimit);
        const res = await q;
        data = res.data;
        error = res.error;
    }
    vipVerifiedPageLoading = false;
    if (error) {
        if (!silent) showToast(error.message || 'Failed to load VIP listings', 'alert-circle');
        vipVerifiedPageHasMore = false;
        renderVipVerifiedListingsPage();
        return;
    }
    const fetched = Array.isArray(data) ? data.length : 0;
    const listingIds = (data || []).map((r) => Number(r?.id) || 0).filter((x) => x > 0);
    const imagesByListingId = await fetchListingImagesMetaByListingIds(client, listingIds);
    const ownerIds = Array.from(new Set((data || []).map((r) => r?.owner_id).filter(Boolean)));
    const profilesById = ownerIds.length ? await fetchProfilesByIds(ownerIds) : {};
    const mapped = (data || []).map((row) => mapSupabaseListingRow({ ...row, listing_images: imagesByListingId[Number(row?.id) || 0] || [] }, profilesById));
    const picked = mapped
        .filter((x) => !hasListingVideo(x))
        .filter((x) => isVipOrVerifiedSeller(x));
    const byId = new Map((vipVerifiedPageListings || []).map((x) => [x.id, x]));
    picked.forEach((x) => byId.set(x.id, x));
    vipVerifiedPageListings = Array.from(byId.values());
    sortListingsInPlace(vipVerifiedPageListings, safeFilters);
    vipVerifiedPageHasMore = fetched >= hardLimit;
    vipVerifiedPageNextCursor = fetched > 0 ? buildListingsNextCursorFromRow((data || [])[fetched - 1], safeFilters) : vipVerifiedPageNextCursor;
    renderVipVerifiedListingsPage();
}

function loadMoreVipVerifiedListingsPage() {
    void fetchVipVerifiedPageFromSupabase({
        silent: false,
        includeProfiles: true,
        limit: 24,
        cursor: vipVerifiedPageNextCursor,
        reset: false,
        filters: currentFilters
    });
}

async function fetchListingsFromSupabase({ silent = false, includeProfiles = true, limit = undefined, append = false, filters = null, cursor = null } = {}) {
    const client = initSupabase();
    if (!client) return;
    const initialLoad = !append && !silent && !homeInitialListingsLoaded;
    if (initialLoad) {
        homeInitialListingsLoading = true;
        homeInitialListingsLoaded = false;
    }
    if (!append) listingsNextCursor = null;
    const baseSelect = 'id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, listing_images(url, thumbnail_url, sort_order)';
    const embeddedSelect = `${baseSelect}, profiles(id, display_name, tag, avatar_url, verified, is_vip)`;
    const safeFilters = filters && typeof filters === 'object' ? filters : (typeof currentFilters === 'object' ? currentFilters : {});
    const safeCursor = cursor && typeof cursor === 'object' ? cursor : null;
    const buildQuery = (selectStr) => {
        let q = client
            .from('listings')
            .select(selectStr);
        q = applyActiveListingsOnly(q);
        q = applyServerFiltersToListingsQuery(q, safeFilters);
        q = applyKeysetCursorToListingsQuery(q, safeCursor, safeFilters);
        if (safeLimit > 0) q = q.limit(safeLimit);
        return q;
    };
    const safeLimitRaw = Number(limit);
    const safeLimit = Number.isFinite(safeLimitRaw) && safeLimitRaw > 0
        ? safeLimitRaw
        : Math.max(INITIAL_LISTINGS_FETCH_LIMIT, Number(listingsLoadedCount) || 0);
    let data = null;
    let error = null;
    {
        const q = buildQuery(includeProfiles ? embeddedSelect : baseSelect);
        const res = await q;
        data = res.data;
        error = res.error;
    }
    let profilesById = {};
    if (error && includeProfiles) {
        const q = buildQuery(baseSelect);
        const res = await q;
        data = res.data;
        error = res.error;
        const ownerIds = Array.from(new Set((data || []).map((r) => r?.owner_id).filter(Boolean)));
        profilesById = ownerIds.length ? await fetchProfilesByIds(ownerIds) : {};
    }
    if (error) {
        if (!silent) showToast(error.message || 'Failed to load listings', 'alert-circle');
        if (initialLoad) {
            homeInitialListingsLoading = false;
            homeInitialListingsLoaded = true;
            listingsHasMore = false;
            scheduleMarketplaceRenders({ listings: true, loadMoreUI: true, iconsRoot: document.getElementById('home-section') });
        }
        return;
    }
    const mapped = (data || []).map((row) => mapSupabaseListingRow(row, profilesById));
    if (append) {
        const byId = new Map((listings || []).map((x) => [x.id, x]));
        mapped.forEach((x) => byId.set(x.id, x));
        listings = Array.from(byId.values());
        sortListingsInPlace(listings, safeFilters);
    } else {
        listings = mapped;
        sortListingsInPlace(listings, safeFilters);
    }
    const fetched = Array.isArray(data) ? data.length : 0;
    if (!append) listingsLoadedCount = 0;
    listingsLoadedCount += fetched;
    listingsHasMore = safeLimit > 0 ? fetched >= safeLimit : false;
    listingsActiveServerFiltersKey = buildListingsServerFiltersKey(safeFilters);
    listingsNextCursor = fetched > 0 ? buildListingsNextCursorFromRow((data || [])[fetched - 1], safeFilters) : listingsNextCursor;
    if (!append && getActiveSectionId() === 'home-section') {
        void fetchVipVideoListingsFromSupabase({ silent: true, includeProfiles: true, limit: 4, filters: safeFilters });
        void fetchVipVerifiedHomeFromSupabase({ silent: true, includeProfiles: true, limit: 4, filters: safeFilters });
    }
    if (initialLoad) {
        homeInitialListingsLoading = false;
        homeInitialListingsLoaded = true;
    }
    clearCardHtmlCache();
    scheduleSaveMarketplaceListingsToStorage();
    scheduleMarketplaceRenders({ listings: true, loadMoreUI: true, iconsRoot: document.getElementById('home-section') });
}

async function refetchListingsForCurrentFilters({ silent = false } = {}) {
    if (DEMO_MODE) {
        renderListings();
        return;
    }
    if (listingsGrid) {
        homeInitialListingsLoading = true;
        homeInitialListingsLoaded = false;
        listingsGrid.innerHTML = getHomeListingsSkeletonHTML(12);
        const empty = document.getElementById('emptyState');
        if (empty) empty.style.display = 'none';
        const gridEl = document.getElementById('listingsGrid');
        if (gridEl) gridEl.style.display = 'grid';
        if (pagination) pagination.innerHTML = '';
        updateLoadMoreListingsUI();
        renderVipVideoSection();
    }
    await fetchListingsFromSupabase({
        silent,
        includeProfiles: true,
        limit: INITIAL_LISTINGS_FETCH_LIMIT,
        append: false,
        filters: currentFilters
    });
}

function triggerListingsRefetch({ immediate = false, silent = false } = {}) {
    const key = buildListingsServerFiltersKey(currentFilters);
    if (!immediate && key === listingsActiveServerFiltersKey && Array.isArray(listings) && listings.length > 0) {
        renderListings();
        ensureHomeVipRowsHydrated({ silent: true, filters: currentFilters });
        return;
    }
    try {
        clearTimeout(listingsRefetchTimer);
    } catch (e) {
        null;
    }
    const run = () => {
        listingsRefetchTimer = null;
        void refetchListingsForCurrentFilters({ silent });
    };
    if (immediate) {
        run();
        return;
    }
    listingsRefetchTimer = setTimeout(run, 250);
}

function flushMarketplaceListingsSave() {
    marketplaceListingsSaveTimer = null;
    marketplaceListingsSaveQueued = false;
    try {
        localStorage.setItem(MARKETPLACE_LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {
        null;
    }
}

function scheduleSaveMarketplaceListingsToStorage(delayMs = 2500) {
    if (marketplaceListingsSaveQueued) return;
    marketplaceListingsSaveQueued = true;
    if (marketplaceListingsSaveTimer) {
        try {
            clearTimeout(marketplaceListingsSaveTimer);
        } catch (e) {
            null;
        }
    }
    marketplaceListingsSaveTimer = setTimeout(() => {
        try {
            if (typeof window.requestIdleCallback === 'function') {
                window.requestIdleCallback(() => flushMarketplaceListingsSave(), { timeout: 4000 });
                return;
            }
        } catch (e) {
            null;
        }
        flushMarketplaceListingsSave();
    }, Math.max(0, Number(delayMs) || 0));
}

function syncMyListingsFromListings() {
    myListings = listings.filter((l) => {
        const oid = String(l?.owner_id || '').trim();
        const uid = String(currentSupabaseUserId || '').trim();
        return oid && uid && oid === uid;
    });
}

function initSupabase() {
    if (supabaseClient) return supabaseClient;
    if (!SUPABASE_PROJECT_URL || !SUPABASE_ANON_KEY) return null;
    if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') return null;
    supabaseClient = supabase.createClient(SUPABASE_PROJECT_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            storage: supabaseAuthStorage
        }
    });
    supabaseClient.auth.onAuthStateChange((event, session) => {
        handleAuthSessionChange(event, session);
    });
    supabaseClient.auth
        .getSession()
        .then(({ data }) => {
            const s = data?.session || null;
            if (s?.user?.id) applyAuthSessionToLocalState(s);
        })
        .catch(() => null);
    return supabaseClient;
}

function applyAuthSessionToLocalState(session) {
    const user = session?.user || null;
    currentSupabaseUserId = user?.id || null;
    currentSupabaseUserEmail = user?.email || '';
    try {
        window.currentSupabaseUserId = currentSupabaseUserId;
        window.currentSupabaseUserEmail = currentSupabaseUserEmail;
    } catch (e) {
        null;
    }

    if (!user) {
        myReferralCount = 0;
        hasLoadedSupabaseProfile = false;
        hasLoadedIdentityStatus = false;
        myIdentityStatus = null;
        userProfile = createEmptyUserProfile();
        favorites = [];
        try {
            localStorage.removeItem(USER_PROFILE_STORAGE_KEY);
        } catch (e) {
            null;
        }
        syncMyListingsFromListings();
        updateProfileUI();
        try {
            renderFavorites();
        } catch (e) {
            null;
        }
        return;
    }

    hasLoadedSupabaseProfile = false;
    hasLoadedIdentityStatus = false;
    myIdentityStatus = null;
    myProfileListingsLoaded = false;
    const meta = user.user_metadata || {};
    const fullName = meta.full_name || meta.name || meta.fullName || '';
    const tag = meta.tag || meta.username || meta.handle || '';
    const avatar = meta.avatar_url || meta.picture || '';

    userProfile = {
        ...createEmptyUserProfile(),
        ...userProfile,
        userId: user.id,
        name: fullName || user.email || 'User',
        tag: tag || `@${user.id.slice(0, 8)}`,
        profilePic: avatar || DEFAULT_AVATAR_SVG,
        joinedDate: user.created_at
            ? new Date(user.created_at).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
            : userProfile.joinedDate
    };

    saveUserProfileToStorage();
    syncMyListingsFromListings();
    updateProfileUI();
}

async function ensureCurrentSupabaseUserId(client) {
    const c = client || initSupabase();
    if (!c) return null;
    if (currentSupabaseUserId) return currentSupabaseUserId;
    try {
        const { data: sessionData } = await c.auth.getSession();
        const session = sessionData?.session || null;
        const sid = String(session?.user?.id || '').trim();
        if (sid) {
            applyAuthSessionToLocalState(session);
            return sid;
        }
        const { data: userData } = await c.auth.getUser();
        const uid = String(userData?.user?.id || '').trim();
        if (uid) {
            currentSupabaseUserId = uid;
            try {
                window.currentSupabaseUserId = uid;
            } catch (e) {
                null;
            }
            return uid;
        }
        return null;
    } catch (e) {
        return null;
    }
}

async function ensureSupabaseProfileRow(client, user) {
    if (!client || !user?.id) return null;
    const { data: existing, error: existingErr } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    const meta = user.user_metadata || {};
    const email = user.email || '';
    const baseName = meta.full_name || meta.name || meta.fullName || (email ? email.split('@')[0] : '');
    const baseTagRaw = meta.tag || meta.username || meta.handle || '';
    const safeTag = (baseTagRaw || `@${user.id.slice(0, 8)}`).toLowerCase().replace(/\s+/g, '');
    const avatar = meta.avatar_url || meta.picture || '';

    if (!existingErr && existing?.id) {
        const currentAvatar =
            pickFirstValue(existing, ['avatar_url', 'profile_pic', 'profilePic', 'picture', 'photo_url']) || '';
        if (!currentAvatar && avatar) {
            const { error } = await client.from('profiles').update({ avatar_url: avatar }).eq('id', user.id);
            if (!error) {
                const { data } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
                return data || existing;
            }
        }
        return existing;
    }

    const payload = {
        id: user.id,
        display_name: baseName || 'User',
        tag: safeTag.startsWith('@') ? safeTag : '@' + safeTag,
        location: '',
        business_type: 'Particulier',
        phone: '',
        work_category: ''
    };
    if (avatar) payload.avatar_url = avatar;

    const { error } = await client.from('profiles').insert(payload).select('*').single();
    if (error) return null;
    const { data } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    return data || null;
}

function applySupabaseProfileRowToLocalState(row, user) {
    if (!row || typeof row !== 'object') return;
    const rawBusinessType = String(row.business_type || row.businessType || userProfile.businessType || '').trim() || 'Particulier';
    const rawWorkCategory = String(row.work_category || row.workCategory || row.category || userProfile.workCategory || '').trim();
    const rawWorkCategoryId = row.work_category_id || row.workCategoryId || userProfile.workCategoryId || null;
    const normalizedBusinessType =
        rawBusinessType === 'Particulier' || rawBusinessType === 'Professionnel'
            ? rawBusinessType
            : 'Professionnel';
    const normalizedWorkCategory =
        normalizedBusinessType === 'Particulier'
            ? ''
            : (rawWorkCategory || (rawBusinessType !== normalizedBusinessType ? rawBusinessType : ''));
    userProfile = {
        ...createEmptyUserProfile(),
        ...userProfile,
        name: row.display_name || userProfile.name,
        tag: row.tag || userProfile.tag,
        profilePic:
            pickFirstValue(row, ['avatar_url', 'profile_pic', 'profilePic', 'picture', 'photo_url']) || userProfile.profilePic,
        coverPic: pickFirstValue(row, ['cover_url', 'cover_pic', 'coverPic', 'cover_url']) || userProfile.coverPic,
        location: row.location || userProfile.location,
        businessType: normalizedBusinessType,
        phone: row.phone || row.phone_number || row.phoneNumber || userProfile.phone,
        workCategory: normalizedWorkCategory,
        workCategoryId: rawWorkCategoryId,
        identityInitializedAt: row.identity_initialized_at || row.identityInitializedAt || userProfile.identityInitializedAt || null,
        identityChangeCount: Number(row.identity_change_count ?? row.identityChangeCount ?? userProfile.identityChangeCount ?? 0) || 0,
        isVip: !!(row.is_vip ?? row.vip ?? row.isVip ?? userProfile.isVip),
        verified: !!(row.verified ?? row.is_verified ?? userProfile.verified),
        isAdmin: !!(row.is_admin ?? row.isAdmin ?? userProfile.isAdmin),
        joinedDate: (row?.created_at || user?.created_at)
            ? new Date(row?.created_at || user.created_at).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
            : userProfile.joinedDate
    };
    hasLoadedSupabaseProfile = true;
    saveUserProfileToStorage();
    syncMyListingsFromListings();
    updateProfileUI();
}

async function refreshAdminFlagFromSupabase(client) {
    if (!client || !currentSupabaseUserId) return;
    try {
        const { data, error } = await client.rpc('is_admin');
        if (error) return;
        if (typeof data !== 'boolean') return;
        if (userProfile.isAdmin === data) return;
        userProfile = { ...userProfile, isAdmin: data };
        saveUserProfileToStorage();
        updateProfileUI();
    } catch (e) {
        null;
    }
}

async function handleAuthSessionChange(event, session) {
    const evt = String(event || '').trim();
    const incomingId = session?.user?.id ? String(session.user.id || '') : '';
    const sameUser = !!incomingId && !!currentSupabaseUserId && String(currentSupabaseUserId) === incomingId;
    if (incomingId) {
        currentSupabaseUserId = incomingId;
        currentSupabaseUserEmail = session?.user?.email || '';
    }
    const resumeEvents = new Set(['TOKEN_REFRESHED', 'USER_UPDATED', 'SIGNED_IN', 'INITIAL_SESSION']);
    if (sameUser && hasLoadedSupabaseProfile && resumeEvents.has(evt)) return;

    applyAuthSessionToLocalState(session);
    const user = session?.user || null;
    lastAuthExpiredHandledAt = 0;
    if (!user) {
        if (!DEMO_MODE) {
            mockChats = {};
            activeChatTag = null;
            setMessageBadge(0);
            setNotificationBadge(0);
            favorites = [];
            myProfileReviewsLoaded = false;
            try {
                renderListings();
                renderFavorites();
            } catch (e) {
                null;
            }
            try {
                const client = initSupabase();
                if (client && messagesRealtimeChannel) client.removeChannel(messagesRealtimeChannel);
                if (client && notificationsRealtimeChannel) client.removeChannel(notificationsRealtimeChannel);
                if (client && livePresenceChannel) client.removeChannel(livePresenceChannel);
            } catch (e) {
                null;
            }
            try {
                if (messagesPollTimer) clearInterval(messagesPollTimer);
                if (notificationsPollTimer) clearInterval(notificationsPollTimer);
            } catch (e) {
                null;
            }
            messagesPollTimer = null;
            notificationsPollTimer = null;
            if (livePresenceTimer) {
                try {
                    clearInterval(livePresenceTimer);
                } catch (e) {
                    null;
                }
            }
            livePresenceTimer = null;
            livePresenceChannel = null;
        }
        return;
    }
    const client = initSupabase();
    if (!client) return;
    const row = await ensureSupabaseProfileRow(client, user);
    if (row && row.deleted_at) {
        await forceVisitorLogout({ message: 'Account disabled', silent: false });
        return;
    }
    if (row) applySupabaseProfileRowToLocalState(row, user);
    await refreshAdminFlagFromSupabase(client);
    await maybeApplyPendingReferralToSupabase({ silent: true });
    await refreshMyReferralCountFromSupabase({ silent: true });
    await refreshMyIdentityStatusFromSupabase({ silent: true });
    updateProfileUI();
    maybeOpenPendingSectionAfterAuth();
    if (row && (isAutoGeneratedTag(row.tag) || !row.display_name)) {
        try {
            if (!sessionStorage.getItem('winjayForcedProfileSetup')) {
                sessionStorage.setItem('winjayForcedProfileSetup', '1');
                showToast('Please set your username to continue', 'alert-circle');
                openModal('editProfileModal');
            }
        } catch (e) {
            showToast('Please set your username to continue', 'alert-circle');
            openModal('editProfileModal');
        }
    }
    await bootstrapMessages();
    await bootstrapNotifications();
    bootstrapLivePresence();
    maybeOpenPendingAdmin();
    await refreshFavoritesFromSupabase({ silent: true });
    try {
        renderListings();
        renderFavorites();
    } catch (e) {
        null;
    }
}

async function bootstrapSupabaseAuth() {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.auth.getSession();
    if (error) return;
    applyAuthSessionToLocalState(data?.session || null);
    if (data?.session?.user) {
        const { data: userData, error: userErr } = await supabaseClient.auth.getUser();
        const authUser = userData?.user || null;
        if (userErr || !authUser?.id) {
            await forceVisitorLogout({ message: 'Session expired', silent: true });
            return;
        }
        const row = await ensureSupabaseProfileRow(supabaseClient, authUser);
        if (row && row.deleted_at) {
            await forceVisitorLogout({ message: 'Account disabled', silent: false });
            return;
        }
        if (row) applySupabaseProfileRowToLocalState(row, authUser);
        await refreshAdminFlagFromSupabase(supabaseClient);
        await maybeApplyPendingReferralToSupabase({ silent: true });
        await refreshMyReferralCountFromSupabase({ silent: true });
        await refreshMyIdentityStatusFromSupabase({ silent: true });
        updateProfileUI();
        maybeOpenPendingSectionAfterAuth();
        await bootstrapMessages();
        await bootstrapNotifications();
        bootstrapLivePresence();
        maybeOpenPendingAdmin();
    }
}

function clearSupabaseAuthTokenFromAllStorages() {
    if (!SUPABASE_PROJECT_REF) return;
    const key = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
    try {
        localStorage.removeItem(key);
    } catch (e) {
        null;
    }
    try {
        sessionStorage.removeItem(key);
    } catch (e) {
        null;
    }
}

function loadUserProfileFromStorage() {
    try {
        const raw = localStorage.getItem(USER_PROFILE_STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return;
        userProfile = { ...userProfile, ...saved };
    } catch (e) {
        return;
    }
}

function saveUserProfileToStorage() {
    try {
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify({ ...userProfile, cachedAt: Date.now() }));
    } catch (e) {
        return;
    }
}

function getFreeVerifiedProgramState() {
    try {
        const raw = localStorage.getItem(FREE_VERIFIED_PROGRAM_STORAGE_KEY);
        if (!raw) return { remaining: FREE_VERIFIED_TOTAL, referrals: {} };
        const saved = JSON.parse(raw);
        const remaining = typeof saved?.remaining === 'number' ? saved.remaining : FREE_VERIFIED_TOTAL;
        const referrals = saved?.referrals && typeof saved.referrals === 'object' ? saved.referrals : {};
        return { remaining: Math.max(0, remaining), referrals };
    } catch (e) {
        return { remaining: FREE_VERIFIED_TOTAL, referrals: {} };
    }
}

function saveFreeVerifiedProgramState(state) {
    try {
        localStorage.setItem(FREE_VERIFIED_PROGRAM_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
        return;
    }
}

function getVerifiedQuestState() {
    try {
        const raw = localStorage.getItem(VERIFIED_QUEST_STORAGE_KEY);
        if (!raw) return { identityStatus: 'none', identityVerified: false, granted: false, referredBy: null };
        const saved = JSON.parse(raw);
        if (!saved || typeof saved !== 'object') return { identityStatus: 'none', identityVerified: false, granted: false, referredBy: null };
        const legacyApproved = !!saved.identityVerified;
        const identityStatusRaw = typeof saved.identityStatus === 'string' ? saved.identityStatus : '';
        const identityStatus = identityStatusRaw ? identityStatusRaw : legacyApproved ? 'approved' : 'none';
        return {
            identityStatus,
            identityVerified: !!saved.identityVerified,
            granted: !!saved.granted,
            referredBy: saved.referredBy || null
        };
    } catch (e) {
        return { identityStatus: 'none', identityVerified: false, granted: false, referredBy: null };
    }
}

function saveVerifiedQuestState(next) {
    try {
        localStorage.setItem(VERIFIED_QUEST_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
        return;
    }
}

function getIdentityQuestStatus() {
    const quest = getVerifiedQuestState();
    const status = String(quest.identityStatus || '').toLowerCase();
    if (status === 'pending' || status === 'approved' || status === 'rejected') return status;
    if (quest.identityVerified) return 'approved';
    return 'none';
}

async function refreshMyIdentityStatusFromSupabase({ silent = true } = {}) {
    hasLoadedIdentityStatus = true;
    myIdentityStatus = null;
    if (DEMO_MODE) {
        myIdentityStatus = getIdentityQuestStatus();
        return myIdentityStatus;
    }
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) {
        myIdentityStatus = getIdentityQuestStatus();
        return myIdentityStatus;
    }
    try {
        const { data, error } = await client
            .from('identity_applications')
            .select('status, created_at')
            .eq('user_id', currentSupabaseUserId)
            .order('created_at', { ascending: false })
            .limit(1);
        if (error) {
            if (!silent) showToast(error.message || 'Failed to load identity status', 'alert-circle');
            myIdentityStatus = getIdentityQuestStatus();
            return myIdentityStatus;
        }
        const row = Array.isArray(data) ? data[0] : null;
        const nextStatus = String(row?.status || '').toLowerCase();
        if (nextStatus === 'pending' || nextStatus === 'approved' || nextStatus === 'rejected') {
            myIdentityStatus = nextStatus;
            const quest = getVerifiedQuestState();
            saveVerifiedQuestState({ ...quest, identityStatus: nextStatus, identityVerified: nextStatus === 'approved' });
            return myIdentityStatus;
        }
        myIdentityStatus = 'none';
        const quest = getVerifiedQuestState();
        saveVerifiedQuestState({ ...quest, identityStatus: 'none', identityVerified: false });
        return myIdentityStatus;
    } catch (e) {
        if (!silent) showToast('Failed to load identity status', 'alert-circle');
        myIdentityStatus = getIdentityQuestStatus();
        return myIdentityStatus;
    }
}

function setPendingReferralFromUrl() {
    try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (!ref) return;
        const raw = String(ref || '').trim();
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
        if (isUuid) {
            sessionStorage.setItem('winjayPendingReferrerId', raw);
            return;
        }
        const tag = raw.startsWith('@') ? raw : '@' + raw;
        if (!/^[a-z0-9_.@]+$/i.test(tag)) return;
        sessionStorage.setItem('winjayPendingRefTag', tag.toLowerCase());
    } catch (e) {
        return;
    }
}

function getPendingReferrerId() {
    try {
        const raw = String(sessionStorage.getItem('winjayPendingReferrerId') || '').trim();
        if (!raw) return null;
        const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw);
        return ok ? raw : null;
    } catch (e) {
        return null;
    }
}

function getPendingReferrerTag() {
    try {
        const raw = String(sessionStorage.getItem('winjayPendingRefTag') || '').trim().toLowerCase();
        if (!raw) return null;
        return raw.startsWith('@') ? raw : '@' + raw;
    } catch (e) {
        return null;
    }
}

function clearPendingReferral() {
    try {
        sessionStorage.removeItem('winjayPendingReferrerId');
    } catch (e) {
        null;
    }
    try {
        sessionStorage.removeItem('winjayPendingRefTag');
    } catch (e) {
        null;
    }
}

async function resolveReferrerIdFromTag(tag) {
    const t = String(tag || '').trim().toLowerCase();
    if (!t) return null;
    if (!/^[a-z0-9_.@]+$/i.test(t)) return null;
    const client = initSupabase();
    if (!client) return null;
    try {
        const { data, error } = await client.rpc('resolve_referrer_id_from_tag', { tag: t });
        if (error) return null;
        return typeof data === 'string' && data ? data : null;
    } catch (e) {
        return null;
    }
}

async function maybeApplyPendingReferralToSupabase({ silent = true } = {}) {
    if (DEMO_MODE) return;
    if (!isLoggedIn()) return;
    const client = initSupabase();
    if (!client) return;

    let referrerId = getPendingReferrerId();
    if (!referrerId) {
        const tag = getPendingReferrerTag();
        if (tag) referrerId = await resolveReferrerIdFromTag(tag);
    }

    if (!referrerId) {
        clearPendingReferral();
        return;
    }
    if (currentSupabaseUserId && referrerId === currentSupabaseUserId) {
        clearPendingReferral();
        return;
    }

    try {
        const { error } = await client.rpc('record_referral', { referrer_id: referrerId });
        if (error) {
            if (!silent) showToast(error.message || 'Failed to apply referral', 'alert-circle');
            return;
        }
        clearPendingReferral();
    } catch (e) {
        if (!silent) showToast('Failed to apply referral', 'alert-circle');
    }
}

function getReferralCountForTag(tag) {
    const program = getFreeVerifiedProgramState();
    return program.referrals[tag] || 0;
}

function getMyReferralCount() {
    if (DEMO_MODE) return getReferralCountForTag(userProfile.tag);
    return myReferralCount || 0;
}

async function refreshMyReferralCountFromSupabase({ silent = true } = {}) {
    if (DEMO_MODE) {
        myReferralCount = getReferralCountForTag(userProfile.tag);
        return;
    }
    if (!currentSupabaseUserId) {
        myReferralCount = 0;
        return;
    }
    const client = initSupabase();
    if (!client) return;
    try {
        const { data, error } = await client.rpc('get_my_referral_count');
        if (error) {
            if (!silent) showToast(error.message || 'Failed to load referrals', 'alert-circle');
            return;
        }
        myReferralCount = Number(data) || 0;
    } catch (e) {
        if (!silent) showToast('Failed to load referrals', 'alert-circle');
    }
}

async function copyTextToClipboard(text) {
    try {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
        }
    } catch (e) {
        return false;
    }
    try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        const ok = document.execCommand('copy');
        ta.remove();
        return ok;
    } catch (e) {
        return false;
    }
}

async function copyPhoneNumber(phone) {
    const text = String(phone || '').trim();
    if (!text) return;
    const ok = await copyTextToClipboard(text);
    showToast(ok ? 'Numéro copié !' : 'Copie impossible', ok ? 'copy' : 'alert-circle');
}

function getReferralLink() {
    const base = `${window.location.origin}${window.location.pathname}`;
    if (currentSupabaseUserId) return `${base}?ref=${encodeURIComponent(currentSupabaseUserId)}`;
    const tag = encodeURIComponent(userProfile.tag);
    return `${base}?ref=${tag}`;
}

function updateFreeVerifiedCounterUI() {
    const program = getFreeVerifiedProgramState();
    const navEl = document.getElementById('freeVerifiedRemainingNav');
    const modalEl = document.getElementById('freeVerifiedRemainingModal');
    const mobileEl = document.getElementById('freeVerifiedRemainingMobile');
    if (navEl) navEl.textContent = program.remaining;
    if (modalEl) modalEl.textContent = program.remaining;
    if (mobileEl) mobileEl.textContent = program.remaining;
}

function updateMobileFooterBarState(forceShow = null) {
    const verified = !!userProfile?.verified;
    const showFreeVerified = isLoggedIn() && hasLoadedSupabaseProfile && !verified;
    const shouldShow = typeof forceShow === 'boolean' ? forceShow : showFreeVerified;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    document.body.classList.toggle('has-mobile-footer-bar', !!shouldShow && isMobile);
    requestAnimationFrame(() => {
        try {
            window.dispatchEvent(new Event('resize'));
        } catch (e) {
            null;
        }
    });
}

function toggleMobileSearchExpand(e) {
    e?.stopPropagation();
    const panel = document.getElementById('mobileSearchExpand');
    if (!panel) return;
    const next = !panel.classList.contains('active');
    panel.classList.toggle('active', next);
    if (next) {
        if (window.getComputedStyle(panel).display === 'none') {
            panel.style.display = 'block';
        }
        const input = document.getElementById('mobileSearchExpandInput');
        const main = document.getElementById('mainSearchInput');
        if (input && main) input.value = main.value || '';
        setTimeout(() => input?.focus(), 50);
        scheduleLucideCreateIcons(panel);
    }
}

function closeMobileSearchExpand() {
    const panel = document.getElementById('mobileSearchExpand');
    if (!panel) return;
    panel.classList.remove('active');
    panel.style.display = '';
    document.getElementById('mobileSearchHistoryDropdown')?.classList.remove('active');
}

function submitMobileSearch() {
    handleSearch('mobileSearchExpandInput', { immediate: true });
    showSection('home-section');
    closeMobileSearchExpand();
}

function handleSearchKeydown(e, inputId = 'mainSearchInput') {
    if (e.key !== 'Enter') return;
    e.preventDefault();
    const input = document.getElementById(inputId) || document.getElementById('mainSearchInput');
    const term = String(input?.value || '').trim();
    if (term.startsWith('@')) {
        openSellerProfile(term.toLowerCase());
        if (inputId === 'mobileSearchExpandInput') closeMobileSearchExpand();
        document.getElementById('searchHistoryDropdown')?.classList.remove('active');
        return;
    }
    handleSearch(inputId, { immediate: true });
    showSection('home-section');
    if (inputId === 'mobileSearchExpandInput') {
        closeMobileSearchExpand();
        return;
    }
    document.getElementById('searchHistoryDropdown')?.classList.remove('active');
}

function getQuestProgress() {
    const quest = getVerifiedQuestState();
    const hasBasics = !!userProfile.name && !!userProfile.tag;
    const hasPhone = !!userProfile.phone;
    const hasWork = !!userProfile.workCategory;
    const refs = getMyReferralCount();
    const hasRefs = refs >= REFERRALS_REQUIRED;
    const identityStatus = hasLoadedIdentityStatus ? (myIdentityStatus || getIdentityQuestStatus()) : getIdentityQuestStatus();
    const hasIdentity = identityStatus === 'approved';
    const total = 5;
    const done = [hasBasics, hasPhone, hasWork, hasRefs, hasIdentity].filter(Boolean).length;
    const percent = Math.round((done / total) * 100);
    return { percent, done, total, refs, hasBasics, hasPhone, hasWork, hasRefs, hasIdentity };
}

function maybeGrantVerifiedBadge() {
    if (!DEMO_MODE) return;
    const quest = getVerifiedQuestState();
    if (userProfile.verified) return;
    if (quest.granted) return;
    const p = getQuestProgress();
    if (p.percent < 100) return;
    const program = getFreeVerifiedProgramState();
    if (program.remaining <= 0) {
        showToast('No free verified badges left.', 'alert-circle');
        return;
    }
    program.remaining -= 1;
    saveFreeVerifiedProgramState(program);
    userProfile.verified = true;
    saveUserProfileToStorage();
    saveVerifiedQuestState({ ...quest, granted: true });
    updateProfileUI();
    updateFreeVerifiedCounterUI();
    openModal('verifiedCongratsModal');
    scheduleLucideCreateIcons(document.getElementById('verifiedCongratsModal'));
}

function renderVerifiedQuestCard() {
    const card = document.getElementById('verifiedQuestCard');
    if (!card) return;
    if (userProfile.verified) {
        card.style.display = 'none';
        return;
    }
    card.style.display = 'block';

    const p = getQuestProgress();
    const identityStatus = hasLoadedIdentityStatus ? (myIdentityStatus || getIdentityQuestStatus()) : getIdentityQuestStatus();
    const referralLink = getReferralLink();

    const doneMark = (done) => done
        ? `<span class="quest-status done"><i data-lucide="check-circle"></i> Done</span>`
        : `<span class="quest-status"><i data-lucide="circle"></i> Pending</span>`;

    const actionBtn = (label, icon, onClick) => `<button class="copy-ref-btn" type="button" onclick="${onClick}"><i data-lucide="${icon}"></i><span>${label}</span></button>`;
    const identityMark = () => {
        if (p.hasIdentity) return doneMark(true);
        if (identityStatus === 'pending') return `<span class="quest-status"><i data-lucide="clock"></i> Reviewing</span>`;
        if (identityStatus === 'rejected') return `<span class="quest-status"><i data-lucide="x-circle"></i> Rejected</span>`;
        return doneMark(false);
    };

    card.innerHTML = `
        <div class="verified-quest-header">
            <div class="verified-quest-title">
                <i data-lucide="badge-check"></i>
                <span>Free Verified Quest</span>
            </div>
            <div class="quest-status ${p.percent === 100 ? 'done' : ''}">${p.percent}%</div>
        </div>
        <div class="verified-quest-progress">
            <div class="progress-row">
                <span>Progress</span>
                <span>${p.done}/${p.total}</span>
            </div>
            <div class="progress-bar"><span style="width:${p.percent}%"></span></div>
        </div>
        <div class="quest-list">
            <div class="quest-item">
                <div class="quest-left">
                    <i class="quest-icon" data-lucide="user"></i>
                    <div class="quest-meta">
                        <div>Set up profile (name + username)</div>
                        <div class="small">Required</div>
                    </div>
                </div>
                <div class="quest-actions">
                    ${!p.hasBasics ? actionBtn('Edit', 'pencil', "openModal('editProfileModal'); scheduleLucideCreateIcons(document.getElementById('editProfileModal'));") : ''}
                    ${doneMark(p.hasBasics)}
                </div>
            </div>
            <div class="quest-item">
                <div class="quest-left">
                    <i class="quest-icon" data-lucide="phone"></i>
                    <div class="quest-meta">
                        <div>Add phone number</div>
                        <div class="small">Required</div>
                    </div>
                </div>
                <div class="quest-actions">
                    ${!p.hasPhone ? actionBtn('Add', 'pencil', "openModal('editProfileModal'); scheduleLucideCreateIcons(document.getElementById('editProfileModal'));") : ''}
                    ${doneMark(p.hasPhone)}
                </div>
            </div>
            <div class="quest-item">
                <div class="quest-left">
                    <i class="quest-icon" data-lucide="briefcase"></i>
                    <div class="quest-meta">
                        <div>Select work category</div>
                        <div class="small">Required</div>
                    </div>
                </div>
                <div class="quest-actions">
                    ${!p.hasWork ? actionBtn('Choose', 'pencil', "openModal('editProfileModal'); scheduleLucideCreateIcons(document.getElementById('editProfileModal'));") : ''}
                    ${doneMark(p.hasWork)}
                </div>
            </div>
            <div class="quest-item">
                <div class="quest-left">
                    <i class="quest-icon" data-lucide="users"></i>
                    <div class="quest-meta">
                        <div>Refer ${REFERRALS_REQUIRED} people</div>
                        <div class="small">${p.refs}/${REFERRALS_REQUIRED} joined</div>
                    </div>
                </div>
                <div class="quest-actions">
                    ${actionBtn('Copy link', 'copy', "copyReferralLink()")}
                    ${doneMark(p.hasRefs)}
                </div>
            </div>
            <div class="quest-item">
                <div class="quest-left">
                    <i class="quest-icon" data-lucide="scan-face"></i>
                    <div class="quest-meta">
                        <div>Verify identity (18+)</div>
                        <div class="small">ID / passport / driving licence</div>
                    </div>
                </div>
                <div class="quest-actions">
                    ${!p.hasIdentity && identityStatus !== 'pending' ? actionBtn(identityStatus === 'rejected' ? 'Resubmit' : 'Verify', 'upload', "openModal('identityVerificationModal'); scheduleLucideCreateIcons(document.getElementById('identityVerificationModal'));") : ''}
                    ${identityMark()}
                </div>
            </div>
        </div>
        <div class="ref-link-box">
            <code id="refLinkCode">${referralLink}</code>
            ${actionBtn('Copy', 'copy', "copyReferralLink()")}
        </div>
    `;

    scheduleLucideCreateIcons(card);
    if (DEMO_MODE) maybeGrantVerifiedBadge();
}

async function copyReferralLink() {
    const link = getReferralLink();
    const ok = await copyTextToClipboard(link);
    showToast(ok ? 'Referral link copied!' : 'Copy failed', ok ? 'copy' : 'alert-circle');
}

function populateWorkCategoriesSelect() {
    const select = document.getElementById('editWorkCategory');
    if (!select) return;

    const placeholder = currentLang === 'ar' ? 'اختر...' : (currentLang === 'en' ? 'Select...' : 'Sélectionnez...');
    select.innerHTML = `<option value="">${placeholder}</option>`;

    businessCategoriesById = {};

    const client = initSupabase();
    if (!client) return;

    client
        .from('business_categories')
        .select('id, group_name, group_name_en, group_name_ar, name, name_en, name_ar, listing_category, listing_subcategory, active')
        .eq('active', true)
        .order('group_name', { ascending: true })
        .order('name', { ascending: true })
        .then(({ data, error }) => {
            if (error || !Array.isArray(data)) return;
            const grouped = new Map();
            data.forEach((row) => {
                if (!row?.id) return;
                businessCategoriesById[String(row.id)] = row;
                const group = currentLang === 'ar'
                    ? String(row.group_name_ar || row.group_name_en || row.group_name || 'Other')
                    : (currentLang === 'en'
                        ? String(row.group_name_en || row.group_name || 'Other')
                        : String(row.group_name || 'Other'));
                if (!grouped.has(group)) grouped.set(group, []);
                grouped.get(group).push(row);
            });

            grouped.forEach((rows, group) => {
                const og = document.createElement('optgroup');
                og.label = group;
                rows.forEach((row) => {
                    const opt = document.createElement('option');
                    opt.value = String(row.id);
                    opt.textContent = currentLang === 'ar'
                        ? String(row.name_ar || row.name_en || row.name || '')
                        : (currentLang === 'en'
                            ? String(row.name_en || row.name || '')
                            : String(row.name || ''));
                    og.appendChild(opt);
                });
                select.appendChild(og);
            });

            const currentValue = userProfile?.workCategoryId || '';
            if (currentValue) select.value = currentValue;
            refreshSelectPicker(select);
        });
}

function updateEditProfileWorkCategoryVisibility() {
    const typeEl = document.getElementById('editBusinessType');
    const workEl = document.getElementById('editWorkCategory');
    if (!typeEl || !workEl) return;
    const type = String(typeEl.value || '').trim();
    const isPro = type === 'Professionnel';
    const wrap = workEl.closest('.form-group');
    if (wrap) wrap.style.display = isPro ? '' : 'none';
    workEl.disabled = !isPro;
    if (!isPro) workEl.value = '';
    refreshSelectPicker(workEl);
}

function handleIdentityFilePreview(inputId, imgId) {
    const input = document.getElementById(inputId);
    const img = document.getElementById(imgId);
    if (!input || !img) return;
    input.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            img.src = ev.target.result;
            img.style.display = 'block';
        };
        reader.readAsDataURL(file);
    });
}

async function submitIdentityVerification() {
    const submitBtn = document.querySelector('#identityVerificationModal .confirm-ok-btn');
    const prevBtnText = submitBtn?.textContent || 'Submit';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }

    const withTimeout = (promise, ms, label) => {
        let timeoutId;
        const timeout = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error(label)), ms);
        });
        return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
    };

    let watchdogFired = false;
    const watchdogId = setTimeout(() => {
        watchdogFired = true;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = prevBtnText;
        }
        showConfirmModal(
            'Still working…',
            'Your upload is taking longer than expected. Please check your internet connection and try again. If the problem continues, try smaller/clearer photos.',
            null,
            false,
            'OK',
            'Close'
        );
    }, 25000);

    try {
        const front = document.getElementById('idFrontInput')?.files?.[0];
        const back = document.getElementById('idBackInput')?.files?.[0];
        const dobValue = document.getElementById('idDob')?.value;
        const confirm18 = document.getElementById('idConfirm18')?.checked;

        if (!front || !back) {
            showConfirmModal('Missing files', 'Please upload both the front and back of your ID.', null, false, 'OK', 'Close');
            return;
        }
        if (!dobValue) {
            showConfirmModal('Missing date of birth', 'Please add your date of birth to continue.', null, false, 'OK', 'Close');
            return;
        }
        if (!confirm18) {
            showConfirmModal('Confirmation required', 'Please confirm you are 18+ and that the document is valid.', null, false, 'OK', 'Close');
            return;
        }

        const dob = new Date(dobValue);
        if (Number.isNaN(dob.getTime())) {
            showConfirmModal('Invalid date', 'The date of birth you selected is not valid. Please choose a correct date.', null, false, 'OK', 'Close');
            return;
        }
        const now = new Date();
        let age = now.getFullYear() - dob.getFullYear();
        const m = now.getMonth() - dob.getMonth();
        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age -= 1;
        if (age < 18) {
            showConfirmModal('Not eligible', 'You must be 18+ to submit identity verification.', null, false, 'OK', 'Close');
            return;
        }

        if (!requireAuthOrPrompt()) return;
        const client = initSupabase();
        if (!client) {
            showConfirmModal('Service unavailable', 'Supabase is not configured. Please try again later.', null, false, 'OK', 'Close');
            return;
        }

        if (submitBtn) submitBtn.textContent = 'Checking session...';
        const { data: userData, error: userErr } = await withTimeout(client.auth.getUser(), 12000, 'Login check timed out');
        const userId = userData?.user?.id || null;
        if (userErr || !userId) {
            showConfirmModal('Session expired', 'Please log in again to continue.', () => openModal('loginModal'), false, 'Log in', 'Close');
            return;
        }

        let frontPath = '';
        let backPath = '';
        const prefix = `${userId}/${Date.now()}`;
        const uploadOne = async (file, kind) => {
            const safe = safeStorageFilename(file?.name || `${kind}.png`);
            const path = `${prefix}_${kind}_${safe}`;
            const { error } = await withTimeout(
                client.storage.from(IDENTITY_DOCS_BUCKET).upload(path, file, {
                cacheControl: '3600',
                upsert: false,
                contentType: file.type || undefined
                }),
                20000,
                `Upload ${kind} timed out`
            );
            if (error) throw error;
            return path;
        };

        try {
            if (submitBtn) submitBtn.textContent = 'Uploading front...';
            frontPath = await uploadOne(front, 'front');
            if (submitBtn) submitBtn.textContent = 'Uploading back...';
            backPath = await uploadOne(back, 'back');
        } catch (e) {
            showConfirmModal('Upload failed', String(e?.message || 'We could not upload your documents. Please try again.'), null, false, 'OK', 'Close');
            return;
        }

        if (submitBtn) submitBtn.textContent = 'Sending request...';
        const { error: insertErr } = await withTimeout(client.from('identity_applications').insert({
            user_id: userId,
            dob: dobValue,
            front_path: frontPath,
            back_path: backPath,
            status: 'pending'
        }), 12000, 'Submission timed out');
        if (insertErr) {
            showConfirmModal('Submission failed', String(insertErr.message || 'We could not submit your request. Please try again.'), null, false, 'OK', 'Close');
            return;
        }

        const quest = getVerifiedQuestState();
        saveVerifiedQuestState({ ...quest, identityStatus: 'pending', identityVerified: false });
        hasLoadedIdentityStatus = true;
        myIdentityStatus = 'pending';
        closeModal('identityVerificationModal');
        showConfirmModal(
            'Request received',
            "Your identity documents were submitted successfully. Our team will review them and you’ll be notified once it’s approved.",
            null,
            false,
            'OK',
            'Close'
        );
        renderVerifiedQuestCard();
    } catch (e) {
        if (watchdogFired) return;
        showConfirmModal('Unexpected error', String(e?.message || 'Something went wrong. Please try again.'), null, false, 'OK', 'Close');
    } finally {
        clearTimeout(watchdogId);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = prevBtnText;
        }
    }
}

const DEMO_MODE = false;

const botProfiles = DEMO_MODE ? [
    { name: "Amine Tech", tag: "@amine_dz", pic: DEFAULT_AVATAR_SVG, cover: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1200", verified: true, vip: true, location: "Alger", businessType: "Magasin d'électronique", joinedDate: "Janvier 2023", rating: 4.9, reviews: 156, reviewsData: [] },
    { name: "Sarah Immo", tag: "@sarah_immobilier", pic: DEFAULT_AVATAR_SVG, cover: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200", verified: true, location: "Oran", businessType: "Agence Immobilière", joinedDate: "Mars 2022", rating: 4.7, reviews: 89, reviewsData: [] },
    { name: "Karim Auto", tag: "@karim_cars", pic: DEFAULT_AVATAR_SVG, cover: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200", verified: false, vip: true, location: "Constantine", businessType: "Vendeur de véhicules", joinedDate: "Juin 2023", rating: 4.5, reviews: 42, reviewsData: [] },
    { name: "Lina Fashion", tag: "@lina_style", pic: DEFAULT_AVATAR_SVG, cover: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200", verified: true, location: "Alger", businessType: "Boutique de Mode", joinedDate: "Novembre 2023", rating: 4.8, reviews: 67, reviewsData: [] },
    { name: "Yacine Informatique", tag: "@yacine_it", pic: DEFAULT_AVATAR_SVG, cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200", verified: false, location: "Sétif", businessType: "Services Informatiques", joinedDate: "Février 2024", rating: 4.6, reviews: 28, reviewsData: [] }
] : [];

const reviewers = DEMO_MODE ? [
    { name: "Mohamed", tag: "@mohamed_dz", pic: DEFAULT_AVATAR_SVG, location: "Alger", businessType: "Particulier", joinedDate: "Janvier 2024", rating: 4.5, reviews: 5, reviewsData: [] },
    { name: "Lydia", tag: "@lydia_b", pic: DEFAULT_AVATAR_SVG, location: "Oran", businessType: "Particulier", joinedDate: "Mars 2024", rating: 4.2, reviews: 3, reviewsData: [] },
    { name: "Ryad", tag: "@ryad_k", pic: DEFAULT_AVATAR_SVG, location: "Alger", businessType: "Passionné Tech", joinedDate: "Février 2024", rating: 4.8, reviews: 12, reviewsData: [] },
    { name: "Sonia", tag: "@sonia_tech", pic: DEFAULT_AVATAR_SVG, location: "Constantine", businessType: "Particulier", joinedDate: "Avril 2024", rating: 4.6, reviews: 8, reviewsData: [] },
    { name: "Imad", tag: "@imad_ed", pic: DEFAULT_AVATAR_SVG, location: "Sétif", businessType: "Particulier", joinedDate: "Mai 2024", rating: 4.4, reviews: 6, reviewsData: [] },
    { name: "Ahmed", tag: "@ahmed_dz", pic: DEFAULT_AVATAR_SVG, location: "Béjaïa", businessType: "Particulier", joinedDate: "Janvier 2024", rating: 4.7, reviews: 15, reviewsData: [] },
    { name: "Fatiha", tag: "@fatiha_w", pic: DEFAULT_AVATAR_SVG, location: "Alger", businessType: "Particulier", joinedDate: "Mars 2024", rating: 4.9, reviews: 20, reviewsData: [] },
    { name: "Kamel", tag: "@kamel_s", pic: DEFAULT_AVATAR_SVG, location: "Tlemcen", businessType: "Particulier", joinedDate: "Février 2024", rating: 4.3, reviews: 4, reviewsData: [] },
    { name: "Yanis", tag: "@yanis_j", pic: DEFAULT_AVATAR_SVG, location: "Alger", businessType: "Particulier", joinedDate: "Avril 2024", rating: 4.5, reviews: 7, reviewsData: [] },
    { name: "Amel", tag: "@amel_z", pic: DEFAULT_AVATAR_SVG, location: "Annaba", businessType: "Particulier", joinedDate: "Mai 2024", rating: 4.6, reviews: 9, reviewsData: [] }
] : [];

const comments = [
    "Excellent service, je recommande vivement !", "Produit conforme à la description, très satisfait.", "Livraison un peu lente mais le vendeur est sérieux.", "Prix très compétitifs par rapport au marché.", "Super communication, transaction fluide.", "C'est ma troisième commande chez ce vendeur, toujours top.", "Un peu déçu par l'emballage mais l'article est nickel.", "Honnête et professionnel. Allez-y les yeux fermés.", "Meilleur rapport qualité-prix sur endinar.com.", "Vendeur très réactif aux messages."
];
const replies = [
    "Merci pour votre confiance !", "Ravi que le produit vous plaise.", "Merci pour votre retour, nous ferons mieux pour la livraison la prochaine fois.", "Toujours un plaisir de vous servir.", "Merci beaucoup pour votre recommandation !"
];

function generateReviews() {
    [userProfile, ...botProfiles, ...reviewers].forEach(profile => {
        const count = Math.floor(Math.random() * (15 - 3 + 1)) + 3;
        profile.reviews = count;
        profile.reviewsData = [];
        for (let i = 0; i < count; i++) {
            const hasReply = Math.random() > 0.6;
            const otherReviewers = reviewers.filter(r => r.tag !== profile.tag);
            const reviewer = otherReviewers[Math.floor(Math.random() * otherReviewers.length)];
            profile.reviewsData.push({
                user: reviewer.name, tag: reviewer.tag, pic: reviewer.pic,
                rating: Math.floor(Math.random() * (5 - 4 + 1)) + 4,
                date: `Il y a ${Math.floor(Math.random() * 30) + 1} jours`,
                comment: comments[Math.floor(Math.random() * comments.length)],
                reply: hasReply ? replies[Math.floor(Math.random() * replies.length)] : null,
                replyAuthorTag: hasReply ? profile.tag : null,
                thread: [],
                likes: Math.floor(Math.random() * 20)
            });
        }
        profile.reviewsData.sort((a, b) => b.likes - a.likes);
    });
}
if (DEMO_MODE) generateReviews();

let listings = DEMO_MODE ? [
    { id: 1, title: "Appartement moderne au Centre-Ville", price: 15000000, category: "Immobilier", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500", location: "16 Alger", date: "Il y a 2 heures", seller: botProfiles[1] },
    { id: 2, title: "PC Gamer RTX 4080", price: 350000, category: "Informatique", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500", location: "31 Oran", date: "Il y a 5 heures", seller: botProfiles[0] },
    { id: 3, title: "Mercedes Benz Classe C 2022", price: 8500000, category: "Automobiles & Véhicules", image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=500", location: "25 Constantine", date: "Hier", seller: botProfiles[2] },
    { id: 4, title: "Villa F5 avec Piscine", price: 45000000, category: "Immobilier", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500", location: "42 Tipaza", date: "Il y a 1 heure", seller: botProfiles[1] },
    { id: 5, title: "iPhone 15 Pro Max 256GB", price: 210000, category: "Téléphones & Accessoires", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500", location: "16 Alger", date: "Il y a 3 heures", seller: botProfiles[0] },
    { id: 6, title: "Volkswagen Golf 8 R-Line", price: 6200000, category: "Automobiles & Véhicules", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500", location: "09 Blida", date: "Il y a 6 heures", seller: botProfiles[2] },
    { id: 7, title: "Canapé d'angle Moderne", price: 85000, category: "Meubles & Maison", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500", location: "19 Sétif", date: "Hier", seller: botProfiles[4] },
    { id: 8, title: "MacBook Pro M3 14\"", price: 380000, category: "Informatique", image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500", location: "31 Oran", date: "Il y a 2 jours", seller: botProfiles[0] },
    { id: 9, title: "Montre Rolex Submariner", price: 1800000, category: "Vêtements & Mode", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500", location: "16 Alger", date: "Il y a 4 heures", seller: botProfiles[3] },
    { id: 10, title: "Appareil Photo Sony A7IV", price: 320000, category: "Électroménager & Électronique", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500", location: "23 Annaba", date: "Hier", seller: botProfiles[0] },
    { id: 11, title: "VTT Rockrider ST 540", price: 55000, category: "Sport", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500", location: "06 Béjaïa", date: "Il y a 8 heures", seller: botProfiles[4] },
    { id: 12, title: "Console PS5 Slim + 2 Manettes", price: 115000, category: "Électroménager & Électronique", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500", location: "15 Tizi Ouzou", date: "Aujourd'hui", seller: botProfiles[0] },
    { id: 13, title: "Terrain Agricole 2 Hectares", price: 12000000, category: "Immobilier", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500", location: "27 Mostaganem", date: "Il y a 3 jours", seller: botProfiles[1] },
    { id: 14, title: "Robot de Cuisine Thermomix", price: 145000, category: "Électroménager & Électronique", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500", location: "16 Alger", date: "Hier", seller: botProfiles[4] },
    { id: 15, title: "Baskets Nike Air Jordan 1", price: 28000, category: "Vêtements & Mode", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500", location: "31 Oran", date: "Il y a 12 heures", seller: botProfiles[3] },
    { id: 16, title: "Tablette iPad Air M2", price: 165000, category: "Informatique", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500", location: "25 Constantine", date: "Il y a 5 heures", seller: botProfiles[0] },
    { id: 17, title: "Moto TMAX 560 Tech Max", price: 2600000, category: "Automobiles & Véhicules", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500", location: "16 Alger", date: "Hier", seller: botProfiles[2] },
    { id: 18, title: "Machine à Café Delonghi", price: 95000, category: "Électroménager & Électronique", image: "https://images.unsplash.com/photo-1520970014086-2208d157c9e2?w=500", location: "13 Tlemcen", date: "Il y a 2 jours", seller: botProfiles[4] },
    { id: 19, title: "Drone DJI Mini 4 Pro", price: 195000, category: "Électroménager & Électronique", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500", location: "16 Alger", date: "Aujourd'hui", seller: botProfiles[0] },
    { id: 20, title: "Studio Meublé à Hydra", price: 75000, category: "Immobilier", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500", location: "16 Alger", date: "Il y a 7 heures", seller: botProfiles[1] },
    { id: 21, title: "Piano Numérique Yamaha", price: 125000, category: "Loisirs & Divertissements", image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500", location: "31 Oran", date: "Hier", seller: botProfiles[4] },
    { id: 22, title: "Perceuse Bosch Professional", price: 18500, category: "Matériaux & Équipement", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500", location: "19 Sétif", date: "Il y a 1 jour", seller: botProfiles[0] },
    { id: 23, title: "Sac à Main Louis Vuitton", price: 240000, category: "Vêtements & Mode", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", location: "16 Alger", date: "Hier", seller: botProfiles[3] },
    { id: 24, title: "Écran Samsung Odyssey G7", price: 110000, category: "Informatique", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", location: "31 Oran", date: "Il y a 4 heures", seller: botProfiles[0] },
    { id: 25, title: "Canne à Pêche Carbone", price: 12000, category: "Loisirs & Divertissements", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500", location: "21 Skikda", date: "Hier", seller: botProfiles[4] },
    { id: 26, title: "Vélo d'appartement Pro", price: 42000, category: "Sport", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500", location: "16 Alger", date: "Il y a 2 jours", seller: botProfiles[4] },
    { id: 27, title: "Casque Bose QC45", price: 58000, category: "Électroménager & Électronique", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", location: "31 Oran", date: "Hier", seller: botProfiles[0] },
    { id: 28, title: "Offre d'emploi: Développeur Frontend (Remote)", price: 0, category: "Emploi", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500", location: "16 Alger", date: "Aujourd'hui", seller: botProfiles[4] },
    { id: 29, title: "Service: Plombier à domicile (Urgence 24/7)", price: 2500, category: "Services", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500", location: "31 Oran", date: "Il y a 3 heures", seller: botProfiles[2] },
    { id: 30, title: "Cours particuliers: Maths & Physique (Lycée)", price: 1500, category: "Services", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500", location: "25 Constantine", date: "Il y a 1 jour", seller: botProfiles[1] },
    { id: 31, title: "Samsung Galaxy S24 Ultra 256GB", price: 195000, category: "Téléphones & Accessoires", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500", location: "16 Alger", date: "Il y a 6 heures", seller: botProfiles[0] },
    { id: 32, title: "Xiaomi Redmi Note 13 Pro (Neuf)", price: 52000, category: "Téléphones & Accessoires", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500", location: "19 Sétif", date: "Hier", seller: botProfiles[4] },
    { id: 33, title: "Générateur Inverter 3.5kW (Professionnel)", price: 145000, category: "Matériaux & Équipement", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500", location: "42 Tipaza", date: "Il y a 2 jours", seller: botProfiles[0] },
    { id: 34, title: "Caisse enregistreuse + TPE (Pack commerce)", price: 68000, category: "Boutiques", image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=500", location: "31 Oran", date: "Il y a 4 jours", seller: botProfiles[3] }
] : [];

function generateListingReviews() {
    const daysAgo = () => `Il y a ${Math.floor(Math.random() * 30) + 1} jours`;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    listings.forEach((listing) => {
        const count = Math.floor(Math.random() * 6) + 2;
        listing.reviewsData = [];
        for (let i = 0; i < count; i++) {
            const reviewer = pick(reviewers);
            const hasReply = Math.random() > 0.65;
            listing.reviewsData.push({
                user: reviewer.name,
                tag: reviewer.tag,
                pic: reviewer.pic,
                rating: Math.floor(Math.random() * 3) + 3,
                date: daysAgo(),
                comment: pick(comments),
                reply: hasReply ? pick(replies) : null,
                replyAuthorTag: hasReply ? (listing.seller?.tag || null) : null,
                thread: [],
                likes: Math.floor(Math.random() * 25)
            });
        }
        listing.reviewsData.sort((a, b) => b.likes - a.likes);
    });
}

if (DEMO_MODE) generateListingReviews();

let myListings = [];
let favorites = [];
const pendingHeartPulses = new Set();
let searchHistory = [];
let editingListingId = null;
let createListingMode = 'create';
let createListingStep = 'details';
let confirmCallback = null;
let currentListingDetailId = null;
let currentSellerProfileTag = null;
let currentSellerProfileOwnerId = null;
let currentSellerProfileName = '';
const listingReviewPanelState = {};
const listingDetailImageIndex = {};
const listingReviewsCache = new Map();
const listingSimilarCache = new Map();
const profileRatingSummaryCache = new Map();
const profileFollowCountsCache = new Map();
const profileFollowStateCache = new Map();
const sellerProfileReviewsCache = new Map();
const sellerProfileCoursesCache = new Map();
let listingDetailViewRecordedListingId = null;
let listingDetailViewRecorded = false;
let sidebarFollowingExpanded = false;
let sidebarFollowingLastLoadedAt = 0;
let sidebarFollowingLoadToken = 0;
let sidebarScrollLockTop = 0;
let sidebarScrollLocked = false;
let modalScrollLockTop = 0;
let modalScrollLocked = false;
let modalScrollLockPrevBodyPaddingRight = '';
let modalScrollLockBodyPaddingRightApplied = false;
let ambassadorsLeaderboardCache = [];
let ambassadorsLeaderboardLoadedAt = 0;
let ambassadorsFeaturedCache = null;
let ambassadorsUIState = { sort: 'trust', wilaya: '' };

let mockChats = DEMO_MODE ? {
    "@amine_dz": {
        name: "Amine Tech",
        pic: DEFAULT_AVATAR_SVG,
        verified: true,
        vip: true,
        messages: [
            { type: "received", text: "Bonjour, est-ce que l'article est toujours disponible ?", time: "Il y a 10 min" },
            { type: "sent", text: "Bonjour ! Oui, l'article est toujours disponible.", time: "Il y a 5 min" }
        ]
    },
    "@sarah_immobilier": {
        name: "Sarah Immo",
        pic: DEFAULT_AVATAR_SVG,
        verified: true,
        vip: false,
        messages: [
            { type: "received", text: "Merci pour votre intérêt !", time: "Il y a 2 heures" }
        ]
    },
    "@karim_cars": {
        name: "Karim Auto",
        pic: DEFAULT_AVATAR_SVG,
        verified: false,
        vip: true,
        messages: [
            { type: "received", text: "Le prix est négociable.", time: "Hier" }
        ]
    }
} : {};

let activeChatTag = Object.keys(mockChats)[0] || null;
let messagesRealtimeChannel = null;
let notificationsRealtimeChannel = null;
let livePresenceChannel = null;
let livePresenceTimer = null;
let lastUnreadMessageCount = 0;
let lastUnreadNotificationCount = 0;
let lastFetchedNotifications = [];
let notificationsPollTimer = null;
let messagesPollTimer = null;
let messagesListFilter = 'all';
let messagesListQuery = '';
let messagesIsLoading = false;
let categoryPickerTargetSelectId = '';
const ADMIN_DASHBOARD_PARAM = 'admin';
const ADMIN_DASHBOARD_VALUE = '1';
const ADMIN_PENDING_OPEN_KEY = 'winjayPendingAdminOpenV1';
const AUTH_PENDING_SECTION_KEY = 'winjayPendingSectionV1';
let profileReviewsTargetColumn = 'profile_id';
let suppressNextMessagesBootstrap = false;
let hasShownProfilesReadToast = false;
let hasShownViewsBackendToast = false;
let messagesHasMediaColumns = null;
const listingTitleCache = new Map();
let voiceRecorder = null;
let voiceChunks = [];
let voiceStream = null;
let cameraStream = null;
let cameraRecorder = null;
let cameraChunks = [];
let recordedVideoUrl = null;
let recordedVideoBlob = null;
let activeVoiceAudio = null;
let activeVoiceContainer = null;
let activeVoiceRafId = null;
let lastVoicePlaybackSnapshot = null;
let pendingActiveChatRefresh = false;
let pendingMessagesInboxRefresh = false;
let queuedIncomingActiveChatRows = [];

function snapshotActiveVoicePlayback() {
    if (!activeVoiceAudio || !activeVoiceContainer) return null;
    const voiceId = activeVoiceContainer.getAttribute('data-voice-id') || '';
    if (!voiceId) return null;
    return {
        voiceId,
        currentTime: Number(activeVoiceAudio.currentTime) || 0,
        wasPlaying: !activeVoiceAudio.paused && !activeVoiceAudio.ended
    };
}

function restoreVoicePlayback(snapshot, { autoplay = false } = {}) {
    if (!snapshot?.voiceId) return;
    const container = getVoiceContainerById(snapshot.voiceId);
    if (!container) return;
    const audio = container.querySelector('.voice-audio');
    if (!audio) return;

    const applyTime = () => {
        try {
            const t = Math.max(0, Number(snapshot.currentTime) || 0);
            if (Number.isFinite(audio.duration) && audio.duration > 0) {
                audio.currentTime = Math.min(audio.duration, t);
            } else {
                audio.currentTime = t;
            }
        } catch (e) {
            null;
        }
        syncVoiceUI(container, audio);
    };

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        applyTime();
    } else {
        audio.addEventListener('loadedmetadata', applyTime, { once: true });
        audio.addEventListener('loadeddata', applyTime, { once: true });
    }

    if (autoplay && snapshot.wasPlaying && document.visibilityState === 'visible') {
        audio.play()
            .then(() => {
                activeVoiceAudio = audio;
                activeVoiceContainer = container;
                setVoicePlayIcon(container, 'pause');
                startActiveVoiceRaf();
                scheduleLucideCreateIcons();
            })
            .catch(() => {
                try {
                    audio.pause();
                } catch (e) {
                    null;
                }
                setVoicePlayIcon(container, 'play');
                scheduleLucideCreateIcons();
            });
        return;
    }

    try {
        audio.pause();
    } catch (e) {
        null;
    }
    setVoicePlayIcon(container, 'play');
    scheduleLucideCreateIcons();
}
let voiceShouldSend = true;
let voiceTimerInterval = null;
let voiceRecordingStart = 0;
let cameraTimerInterval = null;
let cameraRecordingStart = 0;
let lastAuthExpiredHandledAt = 0;

function escapeHtml(str) {
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function escapeJsString(str) {
    return String(str || '')
        .replaceAll('\\', '\\\\')
        .replaceAll("'", "\\'")
        .replaceAll('\n', '\\n')
        .replaceAll('\r', '\\r');
}

function unescapeHtml(str) {
    return String(str)
        .replaceAll('&#039;', "'")
        .replaceAll('&quot;', '"')
        .replaceAll('&gt;', '>')
        .replaceAll('&lt;', '<')
        .replaceAll('&amp;', '&');
}

const WINJAY_LOGO_FILENAME = 'endinar.com.png';
const WINJAY_LOGO_FILENAME_ENCODED = 'endinar.com.png';
const winjayTransparentLogoCache = new Map();
const winjayTransparentLogoPromiseCache = new Map();

function isWinjayLogoSrc(src) {
    if (!src) return false;
    const s = String(src).toLowerCase();
    return (
        s.includes('endinar.com') ||
        s.includes(WINJAY_LOGO_FILENAME) ||
        s.includes(WINJAY_LOGO_FILENAME_ENCODED)
    );
}

function getWinjayLogoImgs() {
    return Array.from(document.querySelectorAll('img')).filter((img) => {
        const src = img.getAttribute('src') || img.src;
        return isWinjayLogoSrc(src);
    });
}

function averageCornerColor(imgData, width, height, corner) {
    const size = Math.min(10, width, height);
    const xStart = corner.includes('r') ? Math.max(0, width - size) : 0;
    const yStart = corner.includes('b') ? Math.max(0, height - size) : 0;
    let r = 0, g = 0, b = 0, n = 0;
    for (let y = yStart; y < yStart + size; y++) {
        for (let x = xStart; x < xStart + size; x++) {
            const i = (y * width + x) * 4;
            const a = imgData[i + 3];
            if (a < 200) continue;
            r += imgData[i];
            g += imgData[i + 1];
            b += imgData[i + 2];
            n += 1;
        }
    }
    if (!n) return { r: 0, g: 0, b: 0 };
    return { r: Math.round(r / n), g: Math.round(g / n), b: Math.round(b / n) };
}

function colorDistance(a, b) {
    return Math.abs(a.r - b.r) + Math.abs(a.g - b.g) + Math.abs(a.b - b.b);
}

async function buildTransparentWinjayLogo(sourceUrl) {
    const src = sourceUrl || WINJAY_LOGO_FILENAME;
    if (winjayTransparentLogoCache.has(src)) return winjayTransparentLogoCache.get(src);
    if (winjayTransparentLogoPromiseCache.has(src)) return winjayTransparentLogoPromiseCache.get(src);

    const promise = new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                const w = img.naturalWidth || img.width;
                const h = img.naturalHeight || img.height;
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext('2d', { willReadFrequently: true });
                if (!ctx) return resolve(null);
                ctx.drawImage(img, 0, 0, w, h);
                const data = ctx.getImageData(0, 0, w, h);

                const c1 = averageCornerColor(data.data, w, h, 'tl');
                const c2 = averageCornerColor(data.data, w, h, 'tr');
                const c3 = averageCornerColor(data.data, w, h, 'bl');
                const c4 = averageCornerColor(data.data, w, h, 'br');
                const bg = {
                    r: Math.round((c1.r + c2.r + c3.r + c4.r) / 4),
                    g: Math.round((c1.g + c2.g + c3.g + c4.g) / 4),
                    b: Math.round((c1.b + c2.b + c3.b + c4.b) / 4)
                };

                const threshold = 85;
                for (let i = 0; i < data.data.length; i += 4) {
                    const a = data.data[i + 3];
                    if (a === 0) continue;
                    const px = { r: data.data[i], g: data.data[i + 1], b: data.data[i + 2] };
                    if (colorDistance(px, bg) <= threshold) {
                        data.data[i + 3] = 0;
                    }
                }

                ctx.putImageData(data, 0, 0);
                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                resolve(null);
            }
        };
        img.onerror = () => resolve(null);
        img.src = src;
    }).then((res) => {
        if (res) winjayTransparentLogoCache.set(src, res);
        winjayTransparentLogoPromiseCache.delete(src);
        return res;
    });

    winjayTransparentLogoPromiseCache.set(src, promise);
    return promise;
}

function applyWinjayLogoTheme() {
    const imgs = getWinjayLogoImgs();
    if (!imgs.length) return;
    imgs.forEach((img) => {
        if (!img.dataset.originalSrc) img.dataset.originalSrc = img.getAttribute('src') || img.src;
    });
    if (!body.classList.contains('dark-mode')) {
        imgs.forEach((img) => {
            if (img.dataset.originalSrc) img.setAttribute('src', img.dataset.originalSrc);
        });
        return;
    }
    const sourceUrl = imgs[0].dataset.originalSrc || imgs[0].getAttribute('src') || imgs[0].src || WINJAY_LOGO_FILENAME;
    buildTransparentWinjayLogo(sourceUrl).then((dataUrl) => {
        if (!dataUrl) return;
        if (!body.classList.contains('dark-mode')) return;
        getWinjayLogoImgs().forEach((img) => img.setAttribute('src', dataUrl));
    });
}

function setThemeMode(nextIsDark, { persist = true } = {}) {
    isDarkMode = !!nextIsDark;
    body.classList.toggle('dark-mode', isDarkMode);
    document.documentElement.classList.toggle('dark-mode', isDarkMode);
    if (persist) {
        try {
            localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? 'dark' : 'light');
        } catch (e) {
            null;
        }
    }

    const icon = document.getElementById('themeIcon');
    if (icon) icon.setAttribute('data-lucide', isDarkMode ? 'sun' : 'moon');
    const toggle = document.getElementById('themeToggle');
    const label = toggle?.querySelector?.('span') || null;
    if (label) label.textContent = isDarkMode ? 'Light mode' : 'Dark mode';
    const settingsToggle = document.getElementById('defaultDarkMode');
    if (settingsToggle) settingsToggle.checked = isDarkMode;

    applyWinjayLogoTheme();
    scheduleLucideCreateIcons(document.body);
}

function loadThemeModeFromStorage() {
    let saved = '';
    try {
        saved = localStorage.getItem(THEME_STORAGE_KEY) || '';
    } catch (e) {
        saved = '';
    }
    if (saved !== 'dark' && saved !== 'light') {
        const htmlDark = document.documentElement.classList.contains('dark-mode');
        setThemeMode(htmlDark, { persist: false });
        return;
    }
    setThemeMode(saved === 'dark', { persist: false });
}

function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const nextType = input.type === 'password' ? 'text' : 'password';
    input.type = nextType;
    const icon = btnEl?.querySelector('i');
    if (icon) icon.setAttribute('data-lucide', nextType === 'password' ? 'eye' : 'eye-off');
    btnEl?.setAttribute('aria-label', nextType === 'password' ? 'Afficher le mot de passe' : 'Masquer le mot de passe');
    scheduleLucideCreateIcons(btnEl instanceof Element ? btnEl : null);
}

function newMessageId() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const pendingChatMessagesByTag = {};

function getPendingChatMessages(tag) {
    const key = String(tag || '');
    const arr = pendingChatMessagesByTag[key];
    return Array.isArray(arr) ? arr : [];
}

function upsertPendingChatMessage(tag, msg) {
    const key = String(tag || '');
    if (!key || !msg) return;
    const arr = Array.isArray(pendingChatMessagesByTag[key]) ? pendingChatMessagesByTag[key] : [];
    const id = String(msg.id || '');
    if (!id) return;
    const idx = arr.findIndex((x) => String(x?.id || '') === id);
    if (idx >= 0) arr[idx] = { ...arr[idx], ...msg };
    else arr.push(msg);
    pendingChatMessagesByTag[key] = arr;
}

function removePendingChatMessage(tag, id) {
    const key = String(tag || '');
    if (!key) return;
    const arr = Array.isArray(pendingChatMessagesByTag[key]) ? pendingChatMessagesByTag[key] : [];
    const next = arr.filter((x) => String(x?.id || '') !== String(id || ''));
    if (next.length) pendingChatMessagesByTag[key] = next;
    else delete pendingChatMessagesByTag[key];
}

function findPendingMessageTagById(id) {
    const target = String(id || '');
    if (!target) return '';
    const active = String(activeChatTag || '');
    if (active && getPendingChatMessages(active).some((m) => String(m?.id || '') === target)) return active;
    for (const key of Object.keys(pendingChatMessagesByTag)) {
        if (getPendingChatMessages(key).some((m) => String(m?.id || '') === target)) return key;
    }
    return '';
}

function getChatMessageStatusLabel(m) {
    const s = String(m?.status || '');
    if (s === 'sending') return 'Sending...';
    if (s === 'uploading') return 'Uploading...';
    if (s === 'failed') return 'Failed';
    return '';
}

function getChatSentIndicatorIconName(m) {
    if (!m || m.type !== 'sent') return '';
    const s = String(m?.status || '');
    if (s === 'sending' || s === 'uploading') return 'clock-3';
    if (s === 'failed') return 'alert-circle';
    return 'check';
}

async function retryChatMessage(pendingId) {
    const tag = findPendingMessageTagById(pendingId);
    if (!tag) return;
    const chat = mockChats?.[tag] || null;
    if (!chat) return;
    const msg = getPendingChatMessages(tag).find((m) => String(m?.id || '') === String(pendingId || '')) || null;
    if (!msg) return;
    if (!requireAuthOrPrompt()) return;

    const nextStatus = msg.kind === 'text' ? 'sending' : 'uploading';
    const nextMsg = { ...msg, status: nextStatus };
    upsertPendingChatMessage(tag, nextMsg);
    const idx = Array.isArray(chat.messages) ? chat.messages.findIndex((m) => String(m?.id || '') === String(pendingId || '')) : -1;
    if (idx >= 0) chat.messages[idx] = nextMsg;

    await switchChat(tag, false, { skipFetch: true });

    if (String(nextMsg.kind || '') === 'text') {
        await sendPendingTextMessage(tag, chat, nextMsg);
        return;
    }
    await sendPendingMediaMessage(tag, chat, nextMsg);
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

function renderChatMessageBody(m, metaHTML = '') {
    const kind = m.kind || (m.url ? 'file' : 'text');
    const status = String(m?.status || '');
    const overlay =
        status === 'sending' || status === 'uploading'
            ? `<div class="chat-media-overlay sending">${escapeHtml(getChatMessageStatusLabel(m) || 'Sending...')}</div>`
            : (status === 'failed'
                ? `<div class="chat-media-overlay failed">${escapeHtml(getChatMessageStatusLabel(m) || 'Failed')}</div>`
                : '');
    if (kind === 'image') {
        const url = String(m.url || '');
        return `<div class="chat-media-wrap"><img src="${url}" alt="${escapeHtml(m.name || 'Image')}" class="chat-media image" onclick="openLightbox('${url}')">${overlay}${metaHTML ? `<div class="chat-media-meta">${metaHTML}</div>` : ''}</div>`;
    }
    if (kind === 'video') {
        const url = String(m.url || '');
        const id = escapeHtml(m.id || '');
        return `
            <div class="chat-media-wrap chat-video-thumb" data-video-id="${id}" onclick="openChatVideoLightbox('${url}')">
                <video src="${url}" class="chat-media chat-video" preload="metadata" playsinline muted></video>
                <div class="chat-video-play"><i data-lucide="play"></i></div>
                <div class="chat-video-duration">0:00</div>
                ${overlay}
                ${metaHTML ? `<div class="chat-media-meta">${metaHTML}</div>` : ''}
            </div>
        `;
    }
    if (kind === 'audio') {
        const id = escapeHtml(m.id || '');
        return `
            <div class="chat-media-wrap">
                <div class="voice-message" data-voice-id="${id}">
                    <button class="voice-play" onclick="toggleVoicePlayback('${id}')"><i data-lucide="play"></i></button>
                    <div class="voice-main">
                        <div class="voice-wave" onclick="seekVoice(event, '${id}')"><div class="voice-wave-fill"></div></div>
                        <div class="voice-bottom">
                            <span class="voice-time">0:00</span>
                            ${metaHTML ? `<span class="voice-meta">${metaHTML}</span>` : ''}
                        </div>
                    </div>
                    <audio class="voice-audio" preload="metadata" src="${m.url}"></audio>
                </div>
                ${overlay}
            </div>
        `;
    }
    if (kind === 'file') {
        const name = escapeHtml(m.name || 'Fichier');
        const url = String(m.url || '');
        return `<div class="chat-media-wrap"><a class="chat-file" href="${url}" download="${name}"><i data-lucide="file"></i><span>${name}</span></a>${overlay}${metaHTML ? `<div class="chat-media-meta">${metaHTML}</div>` : ''}</div>`;
    }
    return `<p>${escapeHtml(m.text || '')}</p>`;
}

function renderChatMessageItemHTML(m) {
    const indicatorName = getChatSentIndicatorIconName(m);
    const indicatorHTML = indicatorName
        ? `<span class="chat-indicator ${escapeHtml(String(m.status || 'sent'))}"><i data-lucide="${escapeHtml(indicatorName)}"></i></span>`
        : '';
    const metaInner = `<span class="chat-time">${escapeHtml(m.time || '')}</span>${indicatorHTML}`;
    const isMedia = !!(m.kind && m.kind !== 'text');
    const metaHTML = isMedia ? metaInner : `<div class="chat-meta">${metaInner}</div>`;
    const retryHTML = String(m.status || '') === 'failed'
        ? `<button type="button" class="chat-retry-btn" onclick="retryChatMessage('${escapeHtml(String(m.id || ''))}')">Retry</button>`
        : '';
    const kindClass = (m.kind && m.kind !== 'text') ? `has-media kind-${escapeHtml(String(m.kind))}` : '';
    const statusClass = m.status ? `msg-${escapeHtml(String(m.status))}` : '';
    return `
        <div class="chat-message ${escapeHtml(m.type || '')} ${kindClass} ${statusClass}" data-message-id="${escapeHtml(String(m.id || ''))}">
            ${renderChatMessageBody(m, isMedia ? metaHTML : '')}
            ${isMedia ? '' : metaHTML}
            ${retryHTML}
        </div>
    `;
}

function supabaseRowToChatMessage(row) {
    if (!row) return null;
    const kind = row.kind || (row.media_url ? 'file' : 'text');
    const type = row.sender_id === currentSupabaseUserId ? 'sent' : 'received';
    const out = {
        id: row.id || newMessageId(),
        type,
        kind,
        created_at: row.created_at,
        read_at: row.read_at,
        time: formatChatTime(row.created_at)
    };
    if (kind === 'text') return { ...out, text: row.body || '' };
    return { ...out, url: row.media_url || '', name: row.media_name || '', mime: row.media_mime || '' };
}

function appendChatMessageToActiveThread(m) {
    if (!m || !activeChatTag) return;
    const chat = mockChats?.[activeChatTag] || null;
    if (chat && Array.isArray(chat.messages)) {
        const exists = chat.messages.some((x) => String(x?.id || '') === String(m.id || ''));
        if (!exists) chat.messages.push(m);
    }
    const messagesEl = document.getElementById('chatMessages');
    if (!messagesEl) return;

    const wasNearBottom = isChatNearBottom(messagesEl);
    messagesEl.insertAdjacentHTML('beforeend', renderChatMessageItemHTML(m));
    const inserted = messagesEl.lastElementChild;
    if (inserted) {
        inserted.querySelectorAll('.voice-message').forEach((container) => initVoiceMessage(container));
        initChatVideoThumbsInChat(inserted);
    }
    if (wasNearBottom) {
        stickChatToBottom(messagesEl, { force: true, attempts: 3 });
    } else {
        chatUnseenNewCount += 1;
        updateChatJumpLatestButton();
    }
    bindChatAutoStickToBottom(messagesEl, { force: wasNearBottom });
    scheduleLucideCreateIcons(inserted || messagesEl);
}

function applyIncomingRowsToActiveChat(rows) {
    if (!Array.isArray(rows) || !rows.length) return;
    rows.forEach((row) => {
        const m = supabaseRowToChatMessage(row);
        if (!m) return;
        appendChatMessageToActiveThread(m);
    });
}

function getChatPreviewText(m) {
    const kind = m?.kind || (m?.url ? 'file' : 'text');
    if (kind === 'image') return 'Photo';
    if (kind === 'video') return 'Vidéo';
    if (kind === 'audio') return 'Message vocal';
    if (kind === 'file') return m?.name ? `Fichier: ${m.name}` : 'Fichier';
    return m?.text || '';
}

async function sendChatMediaMessage({ kind, file, blob, name, pendingId } = {}) {
    if (!activeChatTag) {
        showToast('Select a chat first', 'alert-circle');
        return;
    }
    const chat = mockChats[activeChatTag];
    if (!chat) return;
    if (!requireAuthOrPrompt()) return;

    const source = file || blob;
    if (!source) return;
    const fileName = String(name || file?.name || `${kind || 'file'}.bin`);
    const mime = String(file?.type || blob?.type || '').trim();

    if (DEMO_MODE) {
        const url = URL.createObjectURL(source);
        chat.messages.push({ id: newMessageId(), type: 'sent', kind, url, name: fileName, time: "À l'instant" });
        await switchChat(activeChatTag);
        return;
    }

    const client = initSupabase();
    if (!client || !currentSupabaseUserId || !chat.userId) {
        showToast('Messaging is not ready', 'alert-circle');
        return;
    }

    const effectivePendingId = String(pendingId || newMessageId());
    const createdAt = new Date().toISOString();
    const existingPending = getPendingChatMessages(activeChatTag).find((m) => String(m?.id || '') === effectivePendingId) || null;
    const shouldCreateUrl = !existingPending?.url;
    const localUrl = existingPending?.url || URL.createObjectURL(source);
    const pendingMsg = {
        id: effectivePendingId,
        type: 'sent',
        kind,
        url: localUrl,
        name: fileName,
        time: formatChatTime(createdAt),
        created_at: createdAt,
        status: 'uploading',
        __source: source,
        __mime: mime || '',
        __revokeUrlOnSuccess: shouldCreateUrl
    };
    upsertPendingChatMessage(activeChatTag, pendingMsg);
    const idx = Array.isArray(chat.messages) ? chat.messages.findIndex((m) => String(m?.id || '') === effectivePendingId) : -1;
    if (idx >= 0) chat.messages[idx] = pendingMsg;
    else chat.messages.push(pendingMsg);
    await switchChat(activeChatTag, false, { skipFetch: true });

    const safeName = safeStorageFilename(fileName);
    const objectPath = `${currentSupabaseUserId}/${chat.userId}/${Date.now()}_${effectivePendingId}_${safeName}`;

    const { error: uploadError } = await client.storage.from(MESSAGE_MEDIA_BUCKET).upload(objectPath, source, {
        contentType: mime || undefined,
        upsert: false
    });
    if (uploadError) {
        showToast(uploadError.message || 'Failed to upload media', 'alert-circle');
        const failed = { ...pendingMsg, status: 'failed', __error: uploadError.message || 'upload_failed' };
        upsertPendingChatMessage(activeChatTag, failed);
        const i2 = Array.isArray(chat.messages) ? chat.messages.findIndex((m) => String(m?.id || '') === effectivePendingId) : -1;
        if (i2 >= 0) chat.messages[i2] = failed;
        await switchChat(activeChatTag, false, { skipFetch: true });
        return;
    }

    const { data: publicData } = client.storage.from(MESSAGE_MEDIA_BUCKET).getPublicUrl(objectPath);
    const mediaUrl = publicData?.publicUrl || '';

    const { error: insertError } = await client.from('messages').insert({
        sender_id: currentSupabaseUserId,
        receiver_id: chat.userId,
        body: '',
        kind: kind || 'file',
        media_url: mediaUrl,
        media_name: fileName,
        media_mime: mime || null,
        media_size: Number(source.size) || 0
    });
    if (insertError) {
        if (isMissingColumnError(insertError, 'kind') || isMissingColumnError(insertError, 'media_url')) {
            showToast('Update Supabase messages table to support media (kind/media_url columns).', 'alert-circle');
            messagesHasMediaColumns = false;
        } else {
            showToast(insertError.message || 'Failed to send media', 'alert-circle');
        }
        try { await client.storage.from(MESSAGE_MEDIA_BUCKET).remove([objectPath]); } catch {}
        const failed = { ...pendingMsg, status: 'failed', __error: insertError.message || 'insert_failed' };
        upsertPendingChatMessage(activeChatTag, failed);
        const i2 = Array.isArray(chat.messages) ? chat.messages.findIndex((m) => String(m?.id || '') === effectivePendingId) : -1;
        if (i2 >= 0) chat.messages[i2] = failed;
        await switchChat(activeChatTag, false, { skipFetch: true });
        return;
    }

    removePendingChatMessage(activeChatTag, effectivePendingId);
    if (pendingMsg.__revokeUrlOnSuccess) {
        try { URL.revokeObjectURL(localUrl); } catch {}
    }
    await refreshLiveChatsFromSupabase();
    renderMessagesList();
    await switchChat(activeChatTag);
}

async function sendPendingMediaMessage(tag, chat, msg) {
    if (!tag || !chat || !msg) return false;
    const source = msg.__source || null;
    if (!source) {
        showToast('Cannot retry this media message', 'alert-circle');
        const failed = { ...msg, status: 'failed' };
        upsertPendingChatMessage(tag, failed);
        return false;
    }
    const asFile = source && typeof source === 'object' && typeof source.name === 'string';
    await sendChatMediaMessage({
        kind: msg.kind || 'file',
        file: asFile ? source : undefined,
        blob: asFile ? undefined : source,
        name: msg.name || (asFile ? source.name : 'media.bin'),
        pendingId: msg.id
    });
    return true;
}

async function sendPendingTextMessage(tag, chat, msg) {
    if (!tag || !chat || !msg) return false;
    const client = initSupabase();
    if (!client || !currentSupabaseUserId || !chat.userId) {
        showToast('Messaging is not ready', 'alert-circle');
        const failed = { ...msg, status: 'failed' };
        upsertPendingChatMessage(tag, failed);
        return false;
    }
    let error = null;
    if (messagesHasMediaColumns !== false) {
        const res = await client.from('messages').insert({
            sender_id: currentSupabaseUserId,
            receiver_id: chat.userId,
            body: msg.text || '',
            kind: 'text',
            media_url: null,
            media_name: null,
            media_mime: null,
            media_size: null
        });
        error = res.error;
        if (error && (isMissingColumnError(error, 'kind') || isMissingColumnError(error, 'media_url'))) {
            messagesHasMediaColumns = false;
            const retry = await client.from('messages').insert({
                sender_id: currentSupabaseUserId,
                receiver_id: chat.userId,
                body: msg.text || ''
            });
            error = retry.error;
        } else if (!error) {
            messagesHasMediaColumns = true;
        }
    } else {
        const res = await client.from('messages').insert({
            sender_id: currentSupabaseUserId,
            receiver_id: chat.userId,
            body: msg.text || ''
        });
        error = res.error;
    }
    if (error) {
        if (isMessagingBackendMissing(error)) showToast('Messaging backend is not set up yet', 'alert-circle');
        else showToast(error.message || 'Failed to send message', 'alert-circle');
        const failed = { ...msg, status: 'failed', __error: error.message || 'send_failed' };
        upsertPendingChatMessage(tag, failed);
        const idx = Array.isArray(chat.messages) ? chat.messages.findIndex((m) => String(m?.id || '') === String(msg.id || '')) : -1;
        if (idx >= 0) chat.messages[idx] = failed;
        await switchChat(tag, false, { skipFetch: true });
        return false;
    }
    await createNotificationFromClient({
        recipientId: chat.userId,
        type: 'message_received',
        targetProfileId: chat.userId,
        meta: { chat: `id:${String(chat.userId)}` }
    });
    removePendingChatMessage(tag, msg.id);
    await refreshLiveChatsFromSupabase();
    renderMessagesList();
    await switchChat(tag);
    return true;
}

function openChatFilePicker(type = 'media') {
    const input = document.getElementById('chatFileInput');
    if (!input) return;
    if (type === 'file') {
        input.accept = '.pdf,.doc,.docx,.zip,.rar,.txt';
    } else if (type === 'audio') {
        input.accept = 'audio/*';
    } else {
        input.accept = 'image/*,video/*,audio/*';
    }
    input.click();
}

function toggleChatActions(e) {
    if (e && typeof e.stopPropagation === 'function') e.stopPropagation();
    const actions = document.getElementById('chatActions');
    if (!actions) return;
    actions.classList.toggle('active');
    scheduleLucideCreateIcons(actions);
}

function closeChatActions() {
    const actions = document.getElementById('chatActions');
    if (!actions) return;
    actions.classList.remove('active');
}

function setVoiceRecordingBarVisible(visible) {
    const bar = document.getElementById('voiceRecordingBar');
    if (bar) bar.classList.toggle('active', visible);

    const plusBtn = document.getElementById('chatPlusBtn');
    if (plusBtn) plusBtn.style.display = visible ? 'none' : '';

    const micBtn = document.getElementById('chatMicBtn');
    if (micBtn) micBtn.style.display = visible ? 'none' : '';

    const sendBtn = document.getElementById('chatSendBtn');
    if (sendBtn) sendBtn.style.display = visible ? 'none' : '';

    const input = document.getElementById('chatInput');
    if (input) input.disabled = visible;

    if (visible) closeChatActions();
}

function updateVoiceRecTimer() {
    const el = document.getElementById('voiceRecTime');
    if (!el) return;
    const seconds = (Date.now() - voiceRecordingStart) / 1000;
    el.textContent = formatTime(seconds);
}

async function startVoiceRecording() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        showToast('Votre navigateur ne supporte pas les messages vocaux', 'alert-circle');
        return;
    }

    if (voiceRecorder && voiceRecorder.state === 'recording') return;

    try {
        voiceStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        voiceChunks = [];
        voiceRecorder = new MediaRecorder(voiceStream);
        voiceShouldSend = true;

        voiceRecorder.ondataavailable = (ev) => {
            if (ev.data && ev.data.size > 0) voiceChunks.push(ev.data);
        };

        voiceRecorder.onstop = () => {
            const shouldSend = voiceShouldSend;
            const blob = new Blob(voiceChunks, { type: voiceRecorder.mimeType || 'audio/webm' });
            if (shouldSend) {
                if (DEMO_MODE) {
                    const url = URL.createObjectURL(blob);
                    const chat = mockChats[activeChatTag];
                    if (chat) {
                        chat.messages.push({ id: newMessageId(), type: 'sent', kind: 'audio', url, name: 'message-vocal.webm', time: "À l'instant" });
                        switchChat(activeChatTag);
                    }
                } else {
                    sendChatMediaMessage({ kind: 'audio', blob, name: 'message-vocal.webm' });
                }
            }

            voiceStream?.getTracks()?.forEach(t => t.stop());
            voiceStream = null;
            setVoiceRecordingBarVisible(false);
            if (voiceTimerInterval) clearInterval(voiceTimerInterval);
            voiceTimerInterval = null;
        };

        voiceRecordingStart = Date.now();
        setVoiceRecordingBarVisible(true);
        updateVoiceRecTimer();
        if (voiceTimerInterval) clearInterval(voiceTimerInterval);
        voiceTimerInterval = setInterval(updateVoiceRecTimer, 250);

        voiceRecorder.start();
    } catch {
        showToast('Permission micro refusée', 'alert-circle');
        voiceStream?.getTracks()?.forEach(t => t.stop());
        voiceStream = null;
        setVoiceRecordingBarVisible(false);
    }
}

function stopVoiceRecording(shouldSend = true) {
    if (!voiceRecorder || voiceRecorder.state !== 'recording') return;
    voiceShouldSend = shouldSend;
    try { voiceRecorder.stop(); } catch {}
}

function cancelVoiceRecording() {
    stopVoiceRecording(false);
}

async function openChatCamera() {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
        showToast('Caméra non supportée', 'alert-circle');
        return;
    }

    recordedVideoUrl = null;
    recordedVideoBlob = null;
    cameraChunks = [];

    const preview = document.getElementById('cameraPreview');
    const recordBtn = document.getElementById('cameraRecordBtn');
    const sendBtn = document.getElementById('cameraSendBtn');
    if (!preview || !recordBtn || !sendBtn) return;

    sendBtn.disabled = true;
    recordBtn.classList.remove('recording');
    recordBtn.querySelector('i')?.setAttribute('data-lucide', 'video');
    preview.controls = false;
    preview.muted = true;
    preview.removeAttribute('src');
    preview.srcObject = null;

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        preview.srcObject = cameraStream;
        preview.play();
        openModal('cameraModal');
        scheduleLucideCreateIcons(document.getElementById('cameraModal'));
    } catch {
        showToast('Permission caméra refusée', 'alert-circle');
        cameraStream?.getTracks()?.forEach(t => t.stop());
        cameraStream = null;
    }
}

function toggleCameraRecording() {
    const preview = document.getElementById('cameraPreview');
    const recordBtn = document.getElementById('cameraRecordBtn');
    const sendBtn = document.getElementById('cameraSendBtn');
    if (!preview || !recordBtn || !sendBtn) return;

    if (!cameraStream) {
        showToast('Caméra non prête', 'alert-circle');
        return;
    }

    if (cameraRecorder && cameraRecorder.state === 'recording') {
        cameraRecorder.stop();
        return;
    }

    cameraChunks = [];
    cameraRecorder = new MediaRecorder(cameraStream);

    cameraRecorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) cameraChunks.push(ev.data);
    };

    cameraRecorder.onstop = () => {
        const blob = new Blob(cameraChunks, { type: cameraRecorder.mimeType || 'video/webm' });
        recordedVideoBlob = blob;
        recordedVideoUrl = URL.createObjectURL(blob);

        preview.pause();
        preview.srcObject = null;
        preview.src = recordedVideoUrl;
        preview.controls = true;
        preview.muted = false;
        preview.play();

        recordBtn.classList.remove('recording');
        recordBtn.querySelector('i')?.setAttribute('data-lucide', 'video');
        sendBtn.disabled = false;
        if (cameraTimerInterval) clearInterval(cameraTimerInterval);
        cameraTimerInterval = null;
        scheduleLucideCreateIcons(recordBtn);
    };

    cameraRecorder.start();
    recordBtn.classList.add('recording');
    recordBtn.querySelector('i')?.setAttribute('data-lucide', 'square');
    sendBtn.disabled = true;
    cameraRecordingStart = Date.now();
    const timerEl = document.getElementById('cameraTimer');
    if (timerEl) timerEl.textContent = '0:00';
    if (cameraTimerInterval) clearInterval(cameraTimerInterval);
    cameraTimerInterval = setInterval(() => {
        const el = document.getElementById('cameraTimer');
        if (!el) return;
        const seconds = (Date.now() - cameraRecordingStart) / 1000;
        el.textContent = formatTime(seconds);
    }, 250);
    scheduleLucideCreateIcons(recordBtn);
    showToast('Enregistrement vidéo...', 'video');
}

async function sendRecordedVideo() {
    if (!recordedVideoUrl && !recordedVideoBlob) return;
    if (DEMO_MODE) {
        const chat = mockChats[activeChatTag];
        if (!chat || !recordedVideoUrl) return;
        chat.messages.push({ id: newMessageId(), type: 'sent', kind: 'video', url: recordedVideoUrl, name: 'video.webm', time: "À l'instant" });
        await switchChat(activeChatTag);
        closeCameraModal(true);
        return;
    }

    const blob = recordedVideoBlob || (recordedVideoUrl ? await fetch(recordedVideoUrl).then((r) => r.blob()) : null);
    if (!blob) return;
    await sendChatMediaMessage({ kind: 'video', blob, name: 'video.webm' });
    closeCameraModal(false);
}

function closeCameraModal(keepRecorded = false) {
    if (cameraRecorder && cameraRecorder.state === 'recording') {
        try { cameraRecorder.stop(); } catch {}
    }

    cameraStream?.getTracks()?.forEach(t => t.stop());
    cameraStream = null;
    cameraRecorder = null;
    cameraChunks = [];
    if (cameraTimerInterval) clearInterval(cameraTimerInterval);
    cameraTimerInterval = null;
    const timerEl = document.getElementById('cameraTimer');
    if (timerEl) timerEl.textContent = '0:00';

    const preview = document.getElementById('cameraPreview');
    if (preview) {
        preview.pause();
        preview.srcObject = null;
        if (!keepRecorded) preview.removeAttribute('src');
        preview.controls = false;
        preview.muted = true;
    }

    const sendBtn = document.getElementById('cameraSendBtn');
    if (sendBtn) sendBtn.disabled = true;

    if (!keepRecorded && recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
        recordedVideoUrl = null;
    }
    if (!keepRecorded) recordedVideoBlob = null;

    closeModal('cameraModal');
    scheduleLucideCreateIcons(document.body);
}

async function handleChatFiles(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    e.target.value = '';
    for (const file of files) {
        let kind = 'file';
        if (file.type.startsWith('image/')) kind = 'image';
        else if (file.type.startsWith('video/')) kind = 'video';
        else if (file.type.startsWith('audio/')) kind = 'audio';
        await sendChatMediaMessage({ kind, file, name: file.name });
    }
}

function setupChatFeatures() {
    const fileInput = document.getElementById('chatFileInput');
    if (fileInput) fileInput.addEventListener('change', handleChatFiles);

    document.addEventListener('click', (e) => {
        const actions = document.getElementById('chatActions');
        const inputBar = document.querySelector('.chat-input');
        if (!actions || !inputBar) return;
        if (!actions.classList.contains('active')) return;
        if (actions.contains(e.target) || inputBar.contains(e.target)) return;
        actions.classList.remove('active');
    });

    if (!window.__winjayChatVisibilityHooked) {
        window.__winjayChatVisibilityHooked = true;
        document.addEventListener(
            'visibilitychange',
            () => {
                if (document.visibilityState === 'hidden') {
                    lastVoicePlaybackSnapshot = snapshotActiveVoicePlayback();
                    return;
                }
                pendingActiveChatRefresh = false;
                lastVoicePlaybackSnapshot = null;
                if (queuedIncomingActiveChatRows.length && getActiveSectionId() === 'messages-section' && activeChatTag) {
                    const rows = queuedIncomingActiveChatRows.slice();
                    queuedIncomingActiveChatRows = [];
                    try {
                        applyIncomingRowsToActiveChat(rows);
                    } catch (e) {
                        null;
                    }
                }
            },
            { passive: true }
        );
    }
}

let chatUnseenNewCount = 0;
const renderedChatMessageCounts = new Map();

function isChatNearBottom(el) {
    if (!el) return true;
    const gap = el.scrollHeight - (el.scrollTop + el.clientHeight);
    return gap < 120;
}

function updateChatJumpLatestButton() {
    const btn = document.getElementById('chatJumpLatest');
    const messagesEl = document.getElementById('chatMessages');
    if (!btn || !messagesEl) return;
    const nearBottom = isChatNearBottom(messagesEl);
    if (nearBottom) chatUnseenNewCount = 0;
    const shouldShow = !nearBottom || chatUnseenNewCount > 0;
    btn.style.display = shouldShow ? 'inline-flex' : 'none';
    if (!shouldShow) return;
    btn.textContent = chatUnseenNewCount > 0 ? `New messages (${chatUnseenNewCount})` : 'Jump to latest';
}

function bindChatJumpLatestScroll() {
    const messagesEl = document.getElementById('chatMessages');
    if (!messagesEl || messagesEl.dataset.jumpBound) return;
    messagesEl.dataset.jumpBound = '1';
    messagesEl.addEventListener(
        'scroll',
        () => {
            updateChatJumpLatestButton();
        },
        { passive: true }
    );
}

function jumpChatToLatest() {
    const messagesEl = document.getElementById('chatMessages');
    if (!messagesEl) return;
    chatUnseenNewCount = 0;
    stickChatToBottom(messagesEl, { force: true });
    updateChatJumpLatestButton();
}

function stickChatToBottom(messagesEl, { force = false, attempts = 3 } = {}) {
    if (!messagesEl) return;
    const shouldStick = force || isChatNearBottom(messagesEl);
    if (!shouldStick) return;
    messagesEl.scrollTop = messagesEl.scrollHeight;
    if (attempts > 1) {
        requestAnimationFrame(() => stickChatToBottom(messagesEl, { force, attempts: attempts - 1 }));
    }
}

function bindChatAutoStickToBottom(messagesEl, { force = false, windowMs = 1400 } = {}) {
    if (!messagesEl) return;
    const until = Date.now() + (Number(windowMs) || 0);
    const shouldStickNow = () => force || Date.now() < until || isChatNearBottom(messagesEl);

    const kick = () => {
        if (!shouldStickNow()) return;
        stickChatToBottom(messagesEl, { force: true, attempts: 2 });
    };

    messagesEl.querySelectorAll('img').forEach((img) => {
        if (img.complete) return;
        img.addEventListener('load', kick, { once: true });
        img.addEventListener('error', kick, { once: true });
    });

    messagesEl.querySelectorAll('video').forEach((video) => {
        video.addEventListener('loadedmetadata', kick, { once: true });
        video.addEventListener('loadeddata', kick, { once: true });
        video.addEventListener('error', kick, { once: true });
    });

    requestAnimationFrame(kick);
    setTimeout(kick, 120);
    setTimeout(kick, 420);
}

function setMessageBadge(count) {
    const badge = document.getElementById('messageBadge');
    if (!badge) return;
    const n = Number(count) || 0;
    badge.textContent = String(n);
    badge.style.display = n > 0 ? 'flex' : 'none';
}

function setNotificationBadge(count) {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;
    const n = Number(count) || 0;
    badge.textContent = String(n);
    badge.style.display = n > 0 ? 'flex' : 'none';
}

function formatChatTime(ts) {
    try {
        if (!ts) return '';
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
}

function isMessagingBackendMissing(error) {
    const msg = String(error?.message || '');
    return msg.toLowerCase().includes('relation') && msg.toLowerCase().includes('messages');
}

function isListingReviewsBackendMissing(error) {
    const msg = String(error?.message || '');
    return msg.toLowerCase().includes('relation') && msg.toLowerCase().includes('listing_reviews');
}

function isListingLikesBackendMissing(error) {
    const msg = String(error?.message || '');
    return msg.toLowerCase().includes('relation') && msg.toLowerCase().includes('listing_likes');
}

function isProfileReviewsBackendMissing(error) {
    const msg = String(error?.message || '');
    return msg.toLowerCase().includes('relation') && msg.toLowerCase().includes('profile_reviews');
}

function isNotificationsBackendMissing(error) {
    const msg = String(error?.message || '');
    return msg.toLowerCase().includes('relation') && msg.toLowerCase().includes('notifications');
}

function isMissingColumnError(error, columnName) {
    const msg = String(error?.message || '').toLowerCase();
    const col = String(columnName || '').toLowerCase();
    if (msg.includes('schema cache') && msg.includes(col)) return true;
    return msg.includes('column') && msg.includes(col) && msg.includes('does not exist');
}

function isAuthExpiredError(error) {
    const msg = String(error?.message || '').toLowerCase();
    const status = Number(error?.status) || 0;
    if (msg.includes('jwt expired')) return true;
    if (msg.includes('invalid jwt')) return true;
    if (msg.includes('token has expired')) return true;
    return status === 401;
}

function handleAuthExpired(error) {
    if (!isAuthExpiredError(error)) return false;
    const now = Date.now();
    if (now - (lastAuthExpiredHandledAt || 0) < 5000) return true;
    lastAuthExpiredHandledAt = now;
    showToast('Session expired. Please log in again.', 'alert-circle');
    try {
        handleAuthSessionChange(null);
    } catch (e) {
        null;
    }
    try {
        openModal('loginModal');
    } catch (e) {
        null;
    }
    try {
        supabaseClient?.auth?.signOut?.();
    } catch (e) {
        null;
    }
    return true;
}

function setSellerProfileRouteTag(tag, { pushState = true, from = '', fromListingId = null } = {}) {
    const t = String(tag || '').trim().toLowerCase();
    if (!t) return;
    try {
        localStorage.setItem(SELLER_PROFILE_LAST_TAG_STORAGE_KEY, t);
    } catch (e) {
        null;
    }
    try {
        const url = new URL(window.location.href);
        url.searchParams.delete('listing');
        url.searchParams.delete('new');
        url.searchParams.set('profile', t.startsWith('@') ? t : '@' + t);
        const state = {
            __winjay: true,
            view: 'profile',
            tag: t.startsWith('@') ? t : '@' + t,
            from: from ? String(from) : '',
            fromListingId: fromListingId ? Number(fromListingId) : null
        };
        if (pushState) {
            window.history.pushState(state, '', url.pathname + url.search);
        } else {
            window.history.replaceState(state, '', url.pathname + url.search);
        }
    } catch (e) {
        null;
    }
}

function clearSellerProfileRouteTag() {
    try {
        localStorage.removeItem(SELLER_PROFILE_LAST_TAG_STORAGE_KEY);
    } catch (e) {
        null;
    }
    try {
        const url = new URL(window.location.href);
        url.searchParams.delete('profile');
        window.history.replaceState({}, '', url.toString());
    } catch (e) {
        null;
    }
}

async function refreshUnreadNotificationCount() {
    if (DEMO_MODE) {
        setNotificationBadge(0);
        return 0;
    }
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) {
        setNotificationBadge(0);
        return 0;
    }
    const { count, error } = await client
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('recipient_id', currentSupabaseUserId)
        .is('read_at', null);
    if (error) {
        if (handleAuthExpired(error)) return 0;
        if (!isNotificationsBackendMissing(error)) showToast(error.message || 'Failed to load notifications', 'alert-circle');
        setNotificationBadge(0);
        return 0;
    }
    const n = Number(count) || 0;
    lastUnreadNotificationCount = n;
    setNotificationBadge(n);
    return n;
}

async function fetchNotificationsFromSupabase({ limit = 40 } = {}) {
    if (DEMO_MODE) return [];
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) return [];
    const { data, error } = await client
        .from('notifications')
        .select('id, created_at, recipient_id, actor_id, type, listing_id, target_profile_id, meta, read_at')
        .eq('recipient_id', currentSupabaseUserId)
        .order('created_at', { ascending: false })
        .limit(limit);
    if (error) {
        if (handleAuthExpired(error)) return [];
        if (!isNotificationsBackendMissing(error)) showToast(error.message || 'Failed to load notifications', 'alert-circle');
        return [];
    }
    return Array.isArray(data) ? data : [];
}

async function markAllNotificationsRead() {
    if (DEMO_MODE) return;
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) return;
    const { error } = await client
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('recipient_id', currentSupabaseUserId)
        .is('read_at', null);
    if (error) {
        if (handleAuthExpired(error)) return;
        if (!isNotificationsBackendMissing(error)) showToast(error.message || 'Failed to mark notifications read', 'alert-circle');
    }
}

async function getListingTitleById(listingId) {
    const id = Number(listingId);
    if (!Number.isFinite(id)) return '';
    if (listingTitleCache.has(id)) return listingTitleCache.get(id) || '';
    const local = listings.find((l) => Number(l?.id) === id);
    if (local?.title) {
        listingTitleCache.set(id, String(local.title));
        return String(local.title);
    }
    if (DEMO_MODE) return '';
    const client = initSupabase();
    if (!client) return '';
    const { data } = await client.from('listings').select('title').eq('id', id).maybeSingle();
    const t = String(data?.title || '');
    listingTitleCache.set(id, t);
    return t;
}

async function renderNotificationsModal() {
    const listEl = document.getElementById('notificationsList');
    if (!listEl) return;
    const rows = await fetchNotificationsFromSupabase({ limit: 60 });
    lastFetchedNotifications = rows;
    if (rows.length === 0) {
        listEl.innerHTML = `
            <div class="notification-empty">
                <i data-lucide="bell-off"></i>
                <p>No notifications yet.</p>
            </div>
        `;
        scheduleLucideCreateIcons(listEl);
        return;
    }
    const actorIds = Array.from(new Set(rows.map((r) => r.actor_id).filter(Boolean)));
    const profilesById = actorIds.length ? await fetchProfilesByIds(actorIds) : {};
    const items = await Promise.all(
        rows.map(async (r) => {
            let seller = r.actor_id ? mapProfileRowToSeller(profilesById[r.actor_id] || { id: r.actor_id }) : { name: 'User', tag: '@user', pic: '' };
            const created = r.created_at ? formatRelativeDate(r.created_at) : '';
            const unread = !r.read_at;
            const listingTitle = r.listing_id ? await getListingTitleById(r.listing_id) : '';
            const meta = r.meta && typeof r.meta === 'object' ? r.meta : {};
            let text = '';
            if (r.type === 'listing_like') text = `saved your listing${listingTitle ? `: ${escapeHtml(listingTitle)}` : ''}`;
            else if (r.type === 'listing_share') text = `shared your listing${listingTitle ? `: ${escapeHtml(listingTitle)}` : ''}`;
            else if (r.type === 'listing_review') text = `left a review on your listing${listingTitle ? `: ${escapeHtml(listingTitle)}` : ''}`;
            else if (r.type === 'listing_review_comment') text = `commented on a review on your listing${listingTitle ? `: ${escapeHtml(listingTitle)}` : ''}`;
            else if (r.type === 'listing_review_reply') text = `replied to a review on your listing${listingTitle ? `: ${escapeHtml(listingTitle)}` : ''}`;
            else if (r.type === 'profile_share') text = 'shared your profile';
            else if (r.type === 'profile_review') text = 'left a review on your profile';
            else if (r.type === 'profile_review_comment') text = 'commented on a review on your profile';
            else if (r.type === 'profile_review_reply') text = 'replied to a review on your profile';
            else if (r.type === 'message_received') text = 'sent you a message';
            else if (r.type === 'identity_approved') {
                seller = { name: 'Endinar', tag: '', pic: DEFAULT_AVATAR_SVG };
                text = 'approved your identity verification';
            }
            else if (r.type === 'identity_rejected') {
                seller = { name: 'Endinar', tag: '', pic: DEFAULT_AVATAR_SVG };
                text = 'rejected your identity verification';
            }
            else if (r.type === 'verified_granted') {
                seller = { name: 'Endinar', tag: '', pic: DEFAULT_AVATAR_SVG };
                text = 'your account is now Verified';
            }
            else if (r.type === 'listing_view_milestone') {
                const milestone = Number(meta.milestone) || Number(meta.views) || 0;
                seller = { name: 'Endinar', tag: '', pic: DEFAULT_AVATAR_SVG };
                text = `Your listing reached ${milestone || ''} views${listingTitle ? `: ${escapeHtml(listingTitle)}` : ''}`.trim();
            }
            else text = escapeHtml(String(r.type || 'notification'));
            return `
                <button class="notification-item ${unread ? 'unread' : ''}" type="button" onclick="handleNotificationClick('${r.id}')">
                    <img class="notification-avatar" src="${seller.pic || seller.profilePic || ''}" alt="">
                    <div class="notification-content">
                        <p><strong>${escapeHtml(seller.name)}</strong> <span class="notification-tag">${escapeHtml(seller.tag || '')}</span> ${text}</p>
                        <span>${escapeHtml(created)}</span>
                    </div>
                </button>
            `;
        })
    );
    listEl.innerHTML = items.join('');
    scheduleLucideCreateIcons(listEl);
}

async function handleNotificationClick(notificationId) {
    const id = String(notificationId || '').trim();
    if (!id) return;
    const row = lastFetchedNotifications.find((r) => String(r?.id) === id) || null;
    if (!DEMO_MODE) {
        const client = initSupabase();
        if (client && currentSupabaseUserId) {
            await client
                .from('notifications')
                .update({ read_at: new Date().toISOString() })
                .eq('id', id)
                .eq('recipient_id', currentSupabaseUserId);
        }
        await refreshUnreadNotificationCount();
    }
    closeModal('notificationsModal');
    if (row?.type === 'identity_approved' || row?.type === 'identity_rejected' || row?.type === 'verified_granted') {
        await refreshMyIdentityStatusFromSupabase({ silent: true });
        updateProfileUI();
        showSection('profile-section');
        return;
    }
    if ((row?.type === 'listing_review' || row?.type === 'listing_review_comment' || row?.type === 'listing_review_reply') && row?.listing_id) {
        expandListingReviews(Number(row.listing_id));
        return;
    }
    if ((row?.type === 'listing_like' || row?.type === 'listing_share') && row?.listing_id) {
        openListingDetail(Number(row.listing_id));
        return;
    }
    if ((row?.type === 'profile_review' || row?.type === 'profile_review_comment' || row?.type === 'profile_review_reply') && row?.target_profile_id) {
        openSellerProfileByOwnerId(String(row.target_profile_id), 'reviews');
        return;
    }
    if (row?.type === 'profile_share' && row?.target_profile_id) {
        openSellerProfileByOwnerId(String(row.target_profile_id), 'listings');
        return;
    }
    if (row?.type === 'listing_view_milestone' && row?.listing_id) {
        openListingDetail(Number(row.listing_id));
        return;
    }
    if (row?.type === 'message_received' && row?.actor_id) {
        await startChatWithSellerByOwnerId(String(row.actor_id));
        return;
    }
}

function setupNotificationsRealtime() {
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) return;
    try {
        if (notificationsRealtimeChannel) client.removeChannel(notificationsRealtimeChannel);
    } catch (e) {
        null;
    }
    notificationsRealtimeChannel = client
        .channel('notifications-inbox')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'notifications', filter: `recipient_id=eq.${currentSupabaseUserId}` },
            async () => {
                await refreshUnreadNotificationCount();
                const modalOpen = document.getElementById('notificationsModal')?.classList?.contains('active');
                if (modalOpen) await renderNotificationsModal();
            }
        )
        .subscribe();
}

function setupNotificationsPolling() {
    if (notificationsPollTimer) {
        try {
            clearInterval(notificationsPollTimer);
        } catch (e) {
            null;
        }
        notificationsPollTimer = null;
    }
    if (DEMO_MODE) return;
    if (!currentSupabaseUserId) return;
    notificationsPollTimer = setInterval(async () => {
        if (!currentSupabaseUserId) return;
        const prev = lastUnreadNotificationCount;
        const next = await refreshUnreadNotificationCount();
        const modalOpen = document.getElementById('notificationsModal')?.classList?.contains('active');
        if (modalOpen || next !== prev) await renderNotificationsModal();
    }, 5000);
}

async function bootstrapNotifications() {
    if (DEMO_MODE) {
        setNotificationBadge(0);
        return;
    }
    if (!currentSupabaseUserId) {
        setNotificationBadge(0);
        if (notificationsPollTimer) {
            try {
                clearInterval(notificationsPollTimer);
            } catch (e) {
                null;
            }
            notificationsPollTimer = null;
        }
        return;
    }
    await refreshUnreadNotificationCount();
    setupNotificationsRealtime();
    setupNotificationsPolling();
}

async function createNotificationFromClient({ recipientId, type, listingId = null, targetProfileId = null, meta = {} } = {}) {
    if (DEMO_MODE) return true;
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) return false;
    const recipient = String(recipientId || '').trim();
    if (!recipient || recipient === currentSupabaseUserId) return true;
    const t = String(type || '').trim();
    const m = meta && typeof meta === 'object' ? meta : {};
    const reviewId = String(m.reviewId || m.review_id || '').trim();
    let error = null;
    if (t === 'message_received') {
        const res = await client.rpc('notify_message_received', { receiver_id: recipient, meta: m });
        error = res.error || null;
    } else if (t === 'listing_like') {
        const res = await client.rpc('notify_listing_like', { listing_id: Number(listingId) });
        error = res.error || null;
    } else if (t === 'listing_share') {
        const res = await client.rpc('notify_listing_share', { listing_id: Number(listingId), platform: String(m.platform || '') || null });
        error = res.error || null;
    } else if (t === 'listing_review') {
        const res = await client.rpc('notify_listing_review', { listing_id: Number(listingId), rating: Number(m.rating) || null });
        error = res.error || null;
    } else if (t === 'listing_review_comment') {
        const res = await client.rpc('notify_listing_review_comment', { review_id: reviewId });
        error = res.error || null;
    } else if (t === 'listing_review_reply') {
        const res = await client.rpc('notify_listing_review_reply', { review_id: reviewId });
        error = res.error || null;
    } else if (t === 'profile_review') {
        const target = String(targetProfileId || recipient || '').trim();
        const res = await client.rpc('notify_profile_review', { target_profile_id: target, rating: Number(m.rating) || null });
        error = res.error || null;
    } else if (t === 'profile_share') {
        const target = String(targetProfileId || recipient || '').trim();
        const res = await client.rpc('notify_profile_share', { target_profile_id: target, platform: String(m.platform || '') || null });
        error = res.error || null;
    } else if (t === 'profile_review_comment') {
        const res = await client.rpc('notify_profile_review_comment', { review_id: reviewId });
        error = res.error || null;
    } else if (t === 'profile_review_reply') {
        const res = await client.rpc('notify_profile_review_reply', { review_id: reviewId });
        error = res.error || null;
    } else if (t === 'listing_view_milestone') {
        const res = await client.rpc('notify_listing_view_milestone', {
            listing_id: Number(listingId),
            milestone: m.milestone !== undefined ? Number(m.milestone) || null : null,
            views: m.views !== undefined ? Number(m.views) || null : null
        });
        error = res.error || null;
    } else if (t === 'identity_approved' || t === 'identity_rejected' || t === 'verified_granted') {
        error = { message: 'Not allowed' };
    } else {
        return true;
    }
    if (error) {
        if (isNotificationsBackendMissing(error)) showToast('Notifications backend is not set up yet', 'alert-circle');
        else showToast(error.message || 'Failed to create notification', 'alert-circle');
        return false;
    }
    await refreshUnreadNotificationCount();
    return true;
}

async function fetchProfileByTag(tag) {
    const client = initSupabase();
    if (!client) return null;
    const t = String(tag || '').trim().toLowerCase();
    if (!t) return null;
    const normalized = t.startsWith('@') ? t : '@' + t;
    const selectCols = 'id, created_at, display_name, tag, avatar_url, cover_url, location, business_type, work_category, is_vip, verified';
    const viewAttempt = await client.from('public_profiles').select(selectCols).eq('tag', normalized).maybeSingle();
    if (!viewAttempt.error && viewAttempt.data) return viewAttempt.data;
    const { data, error } = await client.from('profiles').select(selectCols).eq('tag', normalized).maybeSingle();
    if (error) {
        if (!hasShownProfilesReadToast) {
            hasShownProfilesReadToast = true;
            showToast('Enable public SELECT on profiles (or create a public profile policy) to show real name/avatar.', 'alert-circle');
        }
        return null;
    }
    return data || null;
}

async function fetchProfilesByIds(ids) {
    const client = initSupabase();
    if (!client) return {};
    const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (!list.length) return {};

    if (list.length > 200) {
        const out = {};
        for (let i = 0; i < list.length; i += 200) {
            const chunk = list.slice(i, i + 200);
            const part = await fetchProfilesByIds(chunk);
            Object.assign(out, part);
        }
        return out;
    }

    const selectCols = 'id, created_at, display_name, tag, avatar_url, cover_url, location, business_type, work_category, is_vip, verified';
    const viewAttempt = await client.from('public_profiles').select(selectCols).in('id', list);
    if (!viewAttempt.error) {
        const out = {};
        (viewAttempt.data || []).forEach((p) => {
            if (p?.id) out[p.id] = p;
        });
        return out;
    }

    const { data, error } = await client.from('profiles').select(selectCols).in('id', list);
    if (error) {
        if (!hasShownProfilesReadToast) {
            hasShownProfilesReadToast = true;
            showToast('Enable public SELECT on profiles (or create a public profile policy) to show real name/avatar.', 'alert-circle');
        }
        return {};
    }
    const out = {};
    (data || []).forEach((p) => {
        if (p?.id) out[p.id] = p;
    });
    return out;
}

async function fetchProfileFollowCountsByIds(ids) {
    const clean = Array.from(new Set((ids || []).map((x) => String(x || '').trim()).filter(Boolean)));
    if (!clean.length) return {};
    const cached = {};
    const missing = [];
    clean.forEach((id) => {
        if (profileFollowCountsCache.has(id)) {
            cached[id] = profileFollowCountsCache.get(id);
        } else {
            missing.push(id);
        }
    });
    if (!missing.length) return cached;
    const client = initSupabase();
    if (!client) return cached;
    const { data, error } = await client.rpc('get_profile_follow_counts', { profile_ids: missing });
    if (error) return cached;
    (data || []).forEach((row) => {
        const id = String(row.profile_id || '').trim();
        if (!id) return;
        const out = {
            followers: Number(row.followers_count) || 0,
            following: Number(row.following_count) || 0
        };
        profileFollowCountsCache.set(id, out);
        cached[id] = out;
    });
    missing.forEach((id) => {
        if (!cached[id]) {
            const out = { followers: 0, following: 0 };
            profileFollowCountsCache.set(id, out);
            cached[id] = out;
        }
    });
    return cached;
}

async function fetchIsFollowingProfile(targetProfileId) {
    const targetId = String(targetProfileId || '').trim();
    if (!targetId) return false;
    if (!currentSupabaseUserId) return false;
    const key = `${currentSupabaseUserId}:${targetId}`;
    if (profileFollowStateCache.has(key)) return !!profileFollowStateCache.get(key);
    const client = initSupabase();
    if (!client) return false;
    const { data, error } = await client
        .from('profile_follows')
        .select('follower_id')
        .eq('follower_id', currentSupabaseUserId)
        .eq('following_id', targetId)
        .limit(1);
    if (error) return false;
    const isFollowing = Array.isArray(data) && data.length > 0;
    profileFollowStateCache.set(key, isFollowing);
    return isFollowing;
}

async function setFollowProfile(targetProfileId, shouldFollow) {
    const targetId = String(targetProfileId || '').trim();
    if (!targetId) return false;
    if (!requireAuthOrPrompt()) return false;
    if (targetId === currentSupabaseUserId) return false;
    const client = initSupabase();
    if (!client) return false;
    if (shouldFollow) {
        const { error } = await client.from('profile_follows').insert({
            follower_id: currentSupabaseUserId,
            following_id: targetId
        });
        if (error) {
            showToast(error.message || 'Unable to follow', 'alert-circle');
            return false;
        }
    } else {
        const { error } = await client
            .from('profile_follows')
            .delete()
            .eq('follower_id', currentSupabaseUserId)
            .eq('following_id', targetId);
        if (error) {
            showToast(error.message || 'Unable to unfollow', 'alert-circle');
            return false;
        }
    }
    const key = `${currentSupabaseUserId}:${targetId}`;
    profileFollowStateCache.set(key, !!shouldFollow);
    return true;
}

function setProfileFollowCountUI({ followersElId, followingElId, counts }) {
    const c = counts || { followers: 0, following: 0 };
    if (followersElId) {
        const el = document.getElementById(followersElId);
        if (el) el.textContent = String(Number(c.followers) || 0);
    }
    if (followingElId) {
        const el = document.getElementById(followingElId);
        if (el) el.textContent = String(Number(c.following) || 0);
    }
}

function renderSellerFollowButtonState(isFollowing) {
    const btn = document.getElementById('sellerFollowBtn');
    const label = document.getElementById('sellerFollowBtnLabel');
    if (!btn || !label) return;
    if (isFollowing) {
        btn.innerHTML = `<i data-lucide="user-check"></i><span id="sellerFollowBtnLabel">Suivi</span>`;
    } else {
        btn.innerHTML = `<i data-lucide="user-plus"></i><span id="sellerFollowBtnLabel">Suivre</span>`;
    }
    scheduleLucideCreateIcons(btn);
}

async function initSellerProfileFollowUI(ownerId) {
    const id = String(ownerId || '').trim();
    const btn = document.getElementById('sellerFollowBtn');
    if (!btn || !id) return;
    if (!currentSupabaseUserId || id === currentSupabaseUserId) {
        btn.style.display = 'none';
        return;
    }
    btn.style.display = '';
    btn.disabled = true;
    const [countsById, isFollowing] = await Promise.all([
        fetchProfileFollowCountsByIds([id]),
        fetchIsFollowingProfile(id)
    ]);
    const counts = countsById?.[id] || { followers: 0, following: 0 };
    setProfileFollowCountUI({
        followersElId: 'sellerFollowersCount',
        followingElId: 'sellerFollowingCount',
        counts
    });
    renderSellerFollowButtonState(isFollowing);
    btn.disabled = false;
}

async function toggleSellerFollow(ownerId) {
    const id = String(ownerId || '').trim();
    if (!id) return;
    if (!requireAuthOrPrompt()) return;
    if (id === currentSupabaseUserId) return;
    const btn = document.getElementById('sellerFollowBtn');
    if (btn) btn.disabled = true;
    const isFollowing = await fetchIsFollowingProfile(id);
    const next = !isFollowing;
    const ok = await setFollowProfile(id, next);
    if (ok) {
        const sellerCounts = profileFollowCountsCache.get(id) || { followers: 0, following: 0 };
        const meCounts = profileFollowCountsCache.get(currentSupabaseUserId) || { followers: 0, following: 0 };
        const delta = next ? 1 : -1;
        const nextSellerCounts = {
            followers: Math.max(0, Number(sellerCounts.followers) + delta),
            following: Number(sellerCounts.following) || 0
        };
        const nextMeCounts = {
            followers: Number(meCounts.followers) || 0,
            following: Math.max(0, Number(meCounts.following) + delta)
        };
        profileFollowCountsCache.set(id, nextSellerCounts);
        profileFollowCountsCache.set(currentSupabaseUserId, nextMeCounts);
        setProfileFollowCountUI({
            followersElId: 'sellerFollowersCount',
            followingElId: 'sellerFollowingCount',
            counts: nextSellerCounts
        });
        setProfileFollowCountUI({
            followersElId: 'profileFollowersCount',
            followingElId: 'profileFollowingCount',
            counts: nextMeCounts
        });
        renderSellerFollowButtonState(next);
        showToast(next ? 'Abonné.' : 'Désabonné.', 'users');
        sidebarFollowingLastLoadedAt = 0;
        refreshSidebarFollowing({ force: true });
    }
    if (btn) btn.disabled = false;
}

function getSidebarFollowingLimit() {
    return sidebarFollowingExpanded ? 40 : 8;
}

function setSidebarFollowingEmptyState(message) {
    const listEl = document.getElementById('sidebarFollowingList');
    const emptyEl = document.getElementById('sidebarFollowingEmpty');
    const moreBtn = document.getElementById('sidebarFollowingMoreBtn');
    if (listEl) listEl.innerHTML = '';
    if (emptyEl) {
        emptyEl.textContent = String(message || '');
        emptyEl.style.display = message ? '' : 'none';
    }
    if (moreBtn) moreBtn.style.display = 'none';
}

function getSidebarFollowingSkeletonHTML(count) {
    const n = Math.max(1, Number(count) || 0);
    const safe = Math.min(8, n);
    return Array.from({ length: safe })
        .map(
            () => `
            <li class="sidebar-following-skeleton">
                <div class="sidebar-following-avatar skeleton-block"></div>
                <div class="sidebar-following-meta">
                    <div class="sidebar-following-name skeleton-block"></div>
                    <div class="sidebar-following-tag skeleton-block"></div>
                </div>
            </li>
        `
        )
        .join('');
}

function buildSidebarFollowingItemHTML(profileRow) {
    const id = String(profileRow?.id || '').trim();
    if (!id) return '';
    const seller = mapProfileRowToSeller(profileRow?.id ? profileRow : { id });
    const name = escapeHtml(seller.name || 'Seller');
    const tag = escapeHtml(seller.tag || '');
    const pic = seller.pic || seller.profilePic || '';
    return `
        <li>
            <a href="#" class="sidebar-following-link" onclick="openSellerProfileByOwnerId('${id}'); closeSidebarOverlay(); return false;">
                <img class="sidebar-following-avatar" src="${pic}" alt="">
                <div class="sidebar-following-meta">
                    <div class="sidebar-following-name">${name}</div>
                    <div class="sidebar-following-tag">${tag}</div>
                </div>
            </a>
        </li>
    `;
}

function toggleSidebarFollowingExpanded() {
    sidebarFollowingExpanded = !sidebarFollowingExpanded;
    sidebarFollowingLastLoadedAt = 0;
    refreshSidebarFollowing({ force: true });
}

async function refreshSidebarFollowing({ force = false } = {}) {
    const section = document.getElementById('sidebarFollowingSection');
    const divider = document.getElementById('sidebarFollowingDivider');
    const listEl = document.getElementById('sidebarFollowingList');
    const emptyEl = document.getElementById('sidebarFollowingEmpty');
    const moreBtn = document.getElementById('sidebarFollowingMoreBtn');
    if (!section || !listEl || !emptyEl) return;
    section.style.display = '';
    if (divider) divider.style.display = '';

    if (!isLoggedIn()) {
        setSidebarFollowingEmptyState('Connectez-vous pour voir vos abonnements.');
        return;
    }

    const now = Date.now();
    if (!force && sidebarFollowingLastLoadedAt && now - sidebarFollowingLastLoadedAt < 15000) return;
    const token = ++sidebarFollowingLoadToken;
    emptyEl.style.display = 'none';
    listEl.innerHTML = getSidebarFollowingSkeletonHTML(getSidebarFollowingLimit());
    if (moreBtn) moreBtn.style.display = 'none';

    const client = initSupabase();
    if (!client) {
        setSidebarFollowingEmptyState('Supabase n’est pas configuré.');
        return;
    }

    const limit = getSidebarFollowingLimit();
    const res = await client
        .from('profile_follows')
        .select('following_id, created_at')
        .eq('follower_id', currentSupabaseUserId)
        .order('created_at', { ascending: false })
        .limit(limit + 1);

    if (token !== sidebarFollowingLoadToken) return;
    if (res.error) {
        setSidebarFollowingEmptyState(res.error.message || 'Impossible de charger vos abonnements.');
        return;
    }

    const rows = Array.isArray(res.data) ? res.data : [];
    const ids = rows.map((r) => String(r.following_id || '').trim()).filter(Boolean);
    const hasMore = ids.length > limit;
    const visibleIds = ids.slice(0, limit);
    if (!visibleIds.length) {
        setSidebarFollowingEmptyState('Aucun abonnement.');
        return;
    }

    const profilesById = await fetchProfilesByIds(visibleIds);
    if (token !== sidebarFollowingLoadToken) return;
    listEl.innerHTML = visibleIds.map((id) => buildSidebarFollowingItemHTML(profilesById[id] || { id })).join('');
    sidebarFollowingLastLoadedAt = now;

    if (moreBtn) {
        if (sidebarFollowingExpanded) {
            moreBtn.style.display = '';
            moreBtn.textContent = 'Réduire';
        } else if (hasMore) {
            moreBtn.style.display = '';
            moreBtn.textContent = 'Voir tout';
        } else {
            moreBtn.style.display = 'none';
        }
    }
}

function ensureAmbassadorWilayaOptions() {
    const select = document.getElementById('ambassadorWilaya');
    if (!select) return;
    if (select.dataset.ready === '1') return;
    const existing = new Set(Array.from(select.querySelectorAll('option')).map((o) => o.value));
    wilayas.forEach((label) => {
        const code = String(label || '').trim().slice(0, 2);
        if (!code || existing.has(code)) return;
        const opt = document.createElement('option');
        opt.value = code;
        opt.textContent = label;
        select.appendChild(opt);
        existing.add(code);
    });
    select.dataset.ready = '1';
}

function openAmbassadorsSection() {
    showSection('ambassadors-section');
    refreshAmbassadorsSection(false);
}

function handleAmbassadorControlsChange() {
    const sortEl = document.getElementById('ambassadorSort');
    const wilayaEl = document.getElementById('ambassadorWilaya');
    const sort = String(sortEl?.value || 'trust');
    const wilaya = String(wilayaEl?.value || '');
    ambassadorsUIState = { sort, wilaya };
    renderAmbassadorsFromCache();
}

function normalizeAmbassadorRow(row) {
    const userId = String(row?.user_id || row?.id || '').trim();
    if (!userId) return null;
    const safeWilaya = String(row?.wilaya_code || '').trim();
    const trust = Number(row?.trust_score) || 0;
    const followers = Number(row?.followers_count) || 0;
    const recs = Number(row?.total_recommendations) || 0;
    const activeBadges = Number(row?.active_badge_count) || 0;
    const appointedAt = row?.appointed_at || row?.appointedDate || null;
    return {
        user_id: userId,
        display_name: row?.display_name || row?.name || 'Ambassador',
        tag: row?.tag || '',
        avatar_url: row?.avatar_url || row?.profilePic || '',
        wilaya_code: safeWilaya,
        trust_score: trust,
        followers_count: followers,
        total_recommendations: recs,
        active_badge_count: activeBadges,
        appointed_at: appointedAt,
        status: row?.status || 'active'
    };
}

function formatWilayaLabelFromCode(code) {
    const c = String(code || '').trim();
    if (!c) return '';
    const found = wilayas.find((w) => String(w).startsWith(c + ' ')) || wilayas.find((w) => String(w).startsWith(c));
    return found || c;
}

function trustPercent(score) {
    const s = Number(score) || 0;
    return Math.max(0, Math.min(100, s));
}

function buildAmbassadorCardHTML(a, { featured = false, badgeLabel = '' } = {}) {
    const seller = mapProfileRowToSeller({
        id: a.user_id,
        display_name: a.display_name,
        tag: a.tag,
        avatar_url: a.avatar_url
    });
    const name = escapeHtml(seller.name || a.display_name || 'Ambassador');
    const tag = escapeHtml(seller.tag || a.tag || '');
    const pic = seller.pic || seller.profilePic || '';
    const wilaya = escapeHtml(formatWilayaLabelFromCode(a.wilaya_code));
    const pct = trustPercent(a.trust_score);
    const badge = badgeLabel ? `<span class="ambassador-badge">${escapeHtml(badgeLabel)}</span>` : '';
    const since = a.appointed_at ? formatRelativeDate(a.appointed_at) : '';
    return `
        <div class="ambassador-card ${featured ? 'featured' : ''}" onclick="openSellerProfileByOwnerId('${a.user_id}');">
            <div class="ambassador-card-head">
                <img class="ambassador-avatar" src="${pic}" alt="">
                <div class="ambassador-meta">
                    <div class="ambassador-name-row">
                        <div class="ambassador-name">${name}</div>
                        ${badge}
                    </div>
                    <div class="ambassador-sub">${tag}${wilaya ? ` • ${wilaya}` : ''}${since ? ` • ${escapeHtml(since)}` : ''}</div>
                </div>
            </div>
            <div class="ambassador-stats">
                <div class="ambassador-stat">
                    <div class="ambassador-stat-label">Trust</div>
                    <div class="ambassador-trust-bar"><div class="ambassador-trust-fill" style="width:${pct}%;"></div></div>
                </div>
                <div class="ambassador-stat-grid">
                    <div class="ambassador-kpi"><span class="k">${Number(a.followers_count) || 0}</span><span class="l">followers</span></div>
                    <div class="ambassador-kpi"><span class="k">${Number(a.total_recommendations) || 0}</span><span class="l">recs</span></div>
                    <div class="ambassador-kpi"><span class="k">${Number(a.active_badge_count) || 0}</span><span class="l">badges</span></div>
                </div>
            </div>
        </div>
    `;
}

async function fetchPresidentWinnerId() {
    const client = initSupabase();
    if (!client) return '';
    const { data, error } = await client
        .from('president_elections')
        .select('id, winner_id, ended_at, started_at')
        .not('winner_id', 'is', null)
        .order('ended_at', { ascending: false })
        .order('started_at', { ascending: false })
        .limit(1);
    if (error) return '';
    const row = Array.isArray(data) ? data[0] : null;
    return String(row?.winner_id || '').trim();
}

function renderAmbassadorsFromCache() {
    ensureAmbassadorWilayaOptions();
    const featuredEl = document.getElementById('ambassadorsFeatured');
    const listEl = document.getElementById('ambassadorsList');
    if (!featuredEl || !listEl) return;

    let list = Array.isArray(ambassadorsLeaderboardCache) ? ambassadorsLeaderboardCache.slice() : [];
    const wantedWilaya = String(ambassadorsUIState?.wilaya || '').trim();
    if (wantedWilaya) list = list.filter((a) => String(a.wilaya_code || '').trim() === wantedWilaya);

    const sort = String(ambassadorsUIState?.sort || 'trust');
    if (sort === 'followers') list.sort((a, b) => (b.followers_count || 0) - (a.followers_count || 0));
    else if (sort === 'recommendations') list.sort((a, b) => (b.total_recommendations || 0) - (a.total_recommendations || 0));
    else if (sort === 'newest') list.sort((a, b) => new Date(b.appointed_at || 0) - new Date(a.appointed_at || 0));
    else list.sort((a, b) => (b.trust_score || 0) - (a.trust_score || 0));

    const featured = ambassadorsFeaturedCache && (!wantedWilaya || String(ambassadorsFeaturedCache.wilaya_code) === wantedWilaya)
        ? ambassadorsFeaturedCache
        : null;

    if (featured) {
        featuredEl.innerHTML = buildAmbassadorCardHTML(featured, { featured: true, badgeLabel: featured.__badgeLabel || '' });
    } else {
        featuredEl.innerHTML = '';
    }

    if (!list.length) {
        listEl.innerHTML = `<div class="muted" style="padding: 12px 4px;">No ambassadors found.</div>`;
        scheduleLucideCreateIcons(listEl);
        return;
    }

    listEl.innerHTML = list.map((a) => buildAmbassadorCardHTML(a)).join('');
    scheduleLucideCreateIcons(listEl);
}

async function refreshAmbassadorsSection(force = false) {
    ensureAmbassadorWilayaOptions();
    const sortEl = document.getElementById('ambassadorSort');
    const wilayaEl = document.getElementById('ambassadorWilaya');
    if (sortEl && !sortEl.value) sortEl.value = ambassadorsUIState.sort || 'trust';
    if (wilayaEl && typeof ambassadorsUIState.wilaya === 'string') wilayaEl.value = ambassadorsUIState.wilaya;

    const now = Date.now();
    if (!force && ambassadorsLeaderboardLoadedAt && now - ambassadorsLeaderboardLoadedAt < 60000) {
        renderAmbassadorsFromCache();
        return;
    }
    const featuredEl = document.getElementById('ambassadorsFeatured');
    const listEl = document.getElementById('ambassadorsList');
    setInnerHTMLIfEmpty(listEl, getHomeListingsSkeletonHTML(6));
    if (featuredEl) featuredEl.innerHTML = '';

    const client = initSupabase();
    if (!client) {
        if (listEl) listEl.innerHTML = `<div class="muted">Supabase n’est pas configuré.</div>`;
        return;
    }

    const { data, error } = await client
        .from('ambassador_leaderboard')
        .select('user_id, display_name, tag, avatar_url, wilaya_code, trust_score, followers_count, total_recommendations, active_badge_count, appointed_at, status')
        .limit(200);

    if (error) {
        if (listEl) listEl.innerHTML = `<div class="muted">Ambassadors backend not ready.</div>`;
        showToast(error.message || 'Ambassadors backend not ready', 'alert-circle');
        return;
    }

    const rows = Array.isArray(data) ? data : [];
    ambassadorsLeaderboardCache = rows.map(normalizeAmbassadorRow).filter(Boolean);
    ambassadorsLeaderboardLoadedAt = now;

    const winnerId = await fetchPresidentWinnerId();
    if (winnerId) {
        const found = ambassadorsLeaderboardCache.find((a) => String(a.user_id) === String(winnerId));
        if (found) ambassadorsFeaturedCache = { ...found, __badgeLabel: 'President' };
        else ambassadorsFeaturedCache = null;
    } else {
        const top = ambassadorsLeaderboardCache.slice().sort((a, b) => (b.trust_score || 0) - (a.trust_score || 0))[0] || null;
        ambassadorsFeaturedCache = top ? { ...top, __badgeLabel: 'Top ambassador' } : null;
    }

    renderAmbassadorsFromCache();
}

async function fetchListingReviews(listingId) {
    const id = Number(listingId);
    if (!Number.isFinite(id)) return [];
    const client = initSupabase();
    if (!client) return [];
    const baseSelect = 'id, created_at, author_id, rating, comment, reply, reply_author_id, reply_created_at';
    let { data, error } = await client
        .from('listing_reviews')
        .select(baseSelect)
        .eq('listing_id', id)
        .order('created_at', { ascending: false })
        .limit(200);
    if (error && isMissingColumnError(error, 'reply')) {
        const retry = await client
            .from('listing_reviews')
            .select('id, created_at, author_id, rating, comment')
            .eq('listing_id', id)
            .order('created_at', { ascending: false })
            .limit(200);
        data = retry.data;
        error = retry.error;
    }
    if (error) {
        if (isListingReviewsBackendMissing(error)) return [];
        showToast(error.message || 'Failed to load reviews', 'alert-circle');
        return [];
    }
    const rows = Array.isArray(data) ? data : [];
    const reviewIds = rows.map((r) => r.id).filter(Boolean);
    let comments = [];
    if (reviewIds.length) {
        const res = await client
            .from('listing_review_comments')
            .select('id, created_at, review_id, author_id, text')
            .in('review_id', reviewIds)
            .order('created_at', { ascending: true })
            .limit(500);
        if (!res.error) comments = Array.isArray(res.data) ? res.data : [];
    }
    const commentsByReviewId = new Map();
    comments.forEach((c) => {
        const key = String(c.review_id || '');
        if (!key) return;
        if (!commentsByReviewId.has(key)) commentsByReviewId.set(key, []);
        commentsByReviewId.get(key).push(c);
    });
    const authorIds = Array.from(
        new Set(
            rows
                .flatMap((r) => [r.author_id, r.reply_author_id])
                .concat(comments.map((c) => c.author_id))
                .filter(Boolean)
        )
    );
    const profilesById = authorIds.length ? await fetchProfilesByIds(authorIds) : {};
    return rows.map((r) => {
        const p = profilesById[r.author_id] || { id: r.author_id };
        const seller = mapProfileRowToSeller(p);
        const replyProfile = r.reply_author_id ? profilesById[r.reply_author_id] : null;
        const replySeller = replyProfile ? mapProfileRowToSeller(replyProfile) : null;
        const threadRows = commentsByReviewId.get(String(r.id)) || [];
        const thread = threadRows.map((t) => {
            const tp = profilesById[t.author_id] || { id: t.author_id };
            const ts = mapProfileRowToSeller(tp);
            return {
                id: t.id,
                authorId: t.author_id,
                user: ts.name,
                tag: ts.tag,
                pic: ts.pic || ts.profilePic,
                date: formatRelativeDate(t.created_at),
                text: escapeHtml(t.text || '')
            };
        });
        return {
            id: r.id,
            authorId: r.author_id,
            user: seller.name,
            tag: seller.tag,
            pic: seller.pic || seller.profilePic,
            rating: Number(r.rating) || 0,
            date: formatRelativeDate(r.created_at),
            comment: escapeHtml(r.comment || ''),
            reply: r.reply ? escapeHtml(r.reply || '') : null,
            replyAuthorTag: replySeller?.tag || null,
            thread,
            likes: 0
        };
    });
}

async function refreshFavoritesFromSupabase({ silent = false } = {}) {
    if (DEMO_MODE) return;
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) {
        favorites = [];
        return;
    }
    const { data, error } = await client
        .from('listing_likes')
        .select('listing_id')
        .eq('user_id', currentSupabaseUserId)
        .limit(500);
    if (error) {
        if (!silent && !isListingLikesBackendMissing(error)) showToast(error.message || 'Failed to load likes', 'alert-circle');
        favorites = [];
        return;
    }
    favorites = (data || []).map((r) => Number(r.listing_id)).filter((x) => Number.isFinite(x));
}

async function refreshListingCountsFromSupabase(listingId) {
    if (DEMO_MODE) return null;
    const id = Number(listingId);
    if (!Number.isFinite(id)) return null;
    const client = initSupabase();
    if (!client) return null;
    const { data, error } = await client.from('listings').select('id, views_count, likes_count').eq('id', id).maybeSingle();
    if (error || !data?.id) return null;

    const item = listings.find((l) => l.id === id);
    if (item) {
        if (data.views_count !== null && data.views_count !== undefined) item.views_count = Number(data.views_count) || 0;
        if (data.likes_count !== null && data.likes_count !== undefined) item.likes_count = Number(data.likes_count) || 0;
    }

    if (currentListingDetailId === id) {
        const viewsEl = document.getElementById('listingViewsCount');
        if (viewsEl) viewsEl.textContent = String(Number(data.views_count) || 0);
        const likesEl = document.getElementById('listingLikesCount');
        if (likesEl) likesEl.textContent = String(Number(data.likes_count) || 0);
    }

    const render = arguments.length > 1 ? arguments[1]?.render !== false : true;
    if (render) scheduleMarketplaceRenders({ listings: true, iconsRoot: document.getElementById('home-section') });
    return data;
}

const LISTING_VIEW_MILESTONES = [10, 50, 100, 500, 1000];
const listingViewsRecordedThisReload = new Set();
const listingViewsRecordInFlight = new Set();
const listingViewsReloadKey = (() => {
    try {
        return crypto?.randomUUID ? crypto.randomUUID() : `reload_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    } catch (e) {
        return `reload_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
})();

async function maybeNotifyListingViewMilestone(listingId, prevCount, nextCount) {
    if (DEMO_MODE) return;
    if (!currentSupabaseUserId) return;
    const id = Number(listingId);
    if (!Number.isFinite(id)) return;
    const item = listings.find((l) => l.id === id);
    const ownerId = String(item?.owner_id || '').trim();
    if (!ownerId || ownerId === currentSupabaseUserId) return;
    const client = initSupabase();
    if (!client) return;
    const prev = Number(prevCount) || 0;
    const next = Number(nextCount) || 0;
    const milestones = LISTING_VIEW_MILESTONES.filter((m) => m > prev && m <= next);
    for (const milestone of milestones) {
        const dedupe = await client
            .from('notifications')
            .select('id')
            .eq('recipient_id', ownerId)
            .eq('type', 'listing_view_milestone')
            .eq('listing_id', id)
            .contains('meta', { milestone })
            .limit(1);
        if (!dedupe.error && Array.isArray(dedupe.data) && dedupe.data.length) continue;
        await createNotificationFromClient({ recipientId: ownerId, type: 'listing_view_milestone', listingId: id, meta: { milestone, views: next } });
    }
}

async function recordListingView(listingId) {
    if (DEMO_MODE) return;
    const id = Number(listingId);
    if (!Number.isFinite(id)) return;
    if (listingViewsRecordedThisReload.has(id)) return;
    const client = initSupabase();
    if (!client) return;
    if (listingViewsRecordInFlight.has(id)) return;
    listingViewsRecordInFlight.add(id);
    let data = null;
    let error = null;
    try {
        const res = await client.rpc('increment_listing_view', { p_listing_id: id, p_viewer_key: listingViewsReloadKey });
        data = res.data;
        error = res.error;
    } finally {
        listingViewsRecordInFlight.delete(id);
    }
    if (error) {
        if (handleAuthExpired(error)) return;
        const msg = String(error?.message || '');
        const msgLower = msg.toLowerCase();
        if (!hasShownViewsBackendToast) {
            hasShownViewsBackendToast = true;
            if (msgLower.includes('views_count') && msgLower.includes('ambiguous')) {
                showToast('Supabase: fix increment_listing_view (views_count ambiguous).', 'alert-circle');
            } else if (msgLower.includes('could not choose the best candidate function')) {
                showToast('Supabase: remove duplicate increment_listing_view overloads, keep only one.', 'alert-circle');
            } else if (msgLower.includes('permission denied')) {
                showToast('Supabase: grant EXECUTE for increment_listing_view.', 'alert-circle');
            } else if (msgLower.includes('increment_listing_view') && msgLower.includes('does not exist')) {
                showToast('Supabase: create RPC function increment_listing_view to count views.', 'alert-circle');
            } else {
                showToast(msg || 'Failed to record view', 'alert-circle');
            }
        }
        return;
    }
    listingViewsRecordedThisReload.add(id);
    const payload = Array.isArray(data) ? data[0] : data;
    const item = listings.find((l) => l.id === id);
    const prevCount = Number(item?.views_count) || 0;
    const hasServerCount = payload && (payload.views_count !== undefined && payload.views_count !== null);
    const didIncrement = payload && payload.did_increment !== undefined && payload.did_increment !== null ? !!payload.did_increment : true;
    const nextCount = hasServerCount ? Number(payload.views_count) || 0 : (didIncrement ? prevCount + 1 : prevCount);
    if (item) item.views_count = nextCount;
    const el = document.getElementById('listingViewsCount');
    if (el) el.textContent = String(nextCount);
    if (didIncrement) await maybeNotifyListingViewMilestone(id, prevCount, nextCount);
    renderListings();
    await refreshListingCountsFromSupabase(id);
}

async function refreshListingReviewsForListingDetail(listingId, sellerName) {
    if (DEMO_MODE) return;
    const id = Number(listingId);
    if (!Number.isFinite(id)) return;
    const rows = await fetchListingReviews(id);
    listingReviewsCache.set(id, rows);
    const listing = listings.find((l) => l.id === id);
    if (listing) listing.reviewsData = rows;

    const countEl = document.getElementById('listingReviewsCount');
    if (countEl) countEl.textContent = String(rows.length);

    const listEl = document.getElementById('listingReviewsList');
    if (listEl) listEl.innerHTML = getReviewsListHTML(rows, sellerName, false, 'listing', String(id));

    const highlightEl = document.getElementById('listingReviewHighlightWrap');
    if (highlightEl) {
        const best = rows.length ? rows[0] : null;
        highlightEl.innerHTML = best
            ? `
                <div class="review-highlight clickable" onclick="expandListingReviews(${id})">
                    <div class="highlight-label"><i data-lucide="message-circle" style="width: 14px; height: 14px;"></i> Avis sur l'annonce</div>
                    <div class="highlight-content">"${best.comment}"</div>
                    <div class="highlight-author">— ${escapeHtml(best.user || '')}</div>
                </div>
            `
            : '';
    }

    scheduleLucideCreateIcons(document.getElementById('listingReviewsList') || highlightEl || document.body);
}

function computeRatingSummaryFromReviews(reviewsData) {
    const rows = Array.isArray(reviewsData) ? reviewsData : [];
    if (!rows.length) return { rating: 0, reviews: 0 };
    const sum = rows.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    const rating = Math.round((sum / rows.length) * 10) / 10;
    return { rating, reviews: rows.length };
}

async function fetchProfileReviews(profileId) {
    const client = initSupabase();
    if (!client || !profileId) return [];
    const pid = String(profileId || '').trim();
    if (!pid) return [];
    const selectWithReplies = 'id, created_at, author_id, rating, comment, reply, reply_author_id, reply_created_at';
    const baseQuery = (targetColumn, selectCols) =>
        client
            .from('profile_reviews')
            .select(selectCols)
            .eq(targetColumn, pid)
            .order('created_at', { ascending: false })
            .limit(200);

    const firstColumn = profileReviewsTargetColumn || 'target_profile_id';
    let { data, error } = await baseQuery(firstColumn, selectWithReplies);
    if (error && isMissingColumnError(error, 'reply')) {
        const retry = await baseQuery(firstColumn, 'id, created_at, author_id, rating, comment');
        data = retry.data;
        error = retry.error;
    }
    if (error && isMissingColumnError(error, firstColumn)) {
        const fallback = firstColumn === 'profile_id' ? 'target_profile_id' : 'profile_id';
        let retry = await baseQuery(fallback, selectWithReplies);
        if (retry.error && isMissingColumnError(retry.error, 'reply')) retry = await baseQuery(fallback, 'id, created_at, author_id, rating, comment');
        data = retry.data;
        error = retry.error;
        if (!error) profileReviewsTargetColumn = fallback;
    } else if (!error) {
        profileReviewsTargetColumn = firstColumn;
    }
    if (error) {
        if (!isProfileReviewsBackendMissing(error)) showToast(error.message || 'Failed to load reviews', 'alert-circle');
        return [];
    }
    const rows = Array.isArray(data) ? data : [];
    const reviewIds = rows.map((r) => r.id).filter(Boolean);
    let comments = [];
    if (reviewIds.length) {
        const res = await client
            .from('profile_review_comments')
            .select('id, created_at, review_id, author_id, body')
            .in('review_id', reviewIds)
            .order('created_at', { ascending: true })
            .limit(500);
        if (!res.error) comments = Array.isArray(res.data) ? res.data : [];
    }
    const commentsByReviewId = new Map();
    comments.forEach((c) => {
        const key = String(c.review_id || '');
        if (!key) return;
        if (!commentsByReviewId.has(key)) commentsByReviewId.set(key, []);
        commentsByReviewId.get(key).push(c);
    });
    const authorIds = Array.from(
        new Set(
            rows
                .flatMap((r) => [r.author_id, r.reply_author_id])
                .concat(comments.map((c) => c.author_id))
                .filter(Boolean)
        )
    );
    const profilesById = authorIds.length ? await fetchProfilesByIds(authorIds) : {};
    return rows.map((r) => {
        const p = profilesById[r.author_id] || {};
        const replyProfile = r.reply_author_id ? profilesById[r.reply_author_id] : null;
        const replySeller = replyProfile ? mapProfileRowToSeller(replyProfile) : null;
        const threadRows = commentsByReviewId.get(String(r.id)) || [];
        const thread = threadRows.map((t) => {
            const tp = profilesById[t.author_id] || {};
            const ts = mapProfileRowToSeller(tp);
            return {
                id: t.id,
                authorId: t.author_id,
                user: ts.name,
                tag: ts.tag,
                pic: ts.pic || ts.profilePic,
                date: formatRelativeDate(t.created_at),
                text: escapeHtml(t.body || t.text || '')
            };
        });
        return {
            id: r.id,
            authorId: r.author_id,
            user: p.display_name || 'User',
            tag: p.tag || `@${String(r.author_id || '').slice(0, 8)}`,
            pic: p.avatar_url || DEFAULT_AVATAR_SVG,
            rating: Number(r.rating) || 0,
            date: formatRelativeDate(r.created_at),
            comment: escapeHtml(r.comment || ''),
            reply: r.reply ? escapeHtml(r.reply || '') : null,
            replyAuthorTag: replySeller?.tag || null,
            thread,
            likes: 0
        };
    });
}

async function startChatWithSellerByOwnerId(ownerId, listingId = null) {
    if (!ownerId) return;
    if (!requireAuthOrPrompt()) return;
    if (DEMO_MODE) return;
    const lid = Number(listingId) || 0;
    if (lid) {
        const item = listings.find((l) => l.id === lid);
        trackListingContactAction('message', lid);
        trackAnalyticsEvent('chat_start', {
            listingId: lid,
            category: item?.category || null,
            wilaya: item?.wilaya || null,
            dedupeKey: `chat_start:${lid}:${getAnalyticsSessionId()}`
        });
    } else {
        trackAnalyticsEvent('chat_start', { dedupeKey: `chat_start:direct:${getAnalyticsSessionId()}` });
    }
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) return;
    let profileRow = null;
    const { data, error } = await client.from('profiles').select('*').eq('id', ownerId).maybeSingle();
    if (error) {
        if (!hasShownProfilesReadToast) {
            hasShownProfilesReadToast = true;
            showToast('Profiles are private. Enable profiles SELECT policy in Supabase to show real name/avatar.', 'alert-circle');
        }
    } else if (data?.id) {
        profileRow = data;
    }
    const seller = mapProfileRowToSeller(profileRow?.id ? profileRow : { id: ownerId });
    const chatKey = `id:${ownerId}`;
    const chatTag = seller.tag || `@${String(ownerId).slice(0, 8)}`;
    suppressNextMessagesBootstrap = true;
    showSection('messages-section');
    await bootstrapMessages();
    if (!mockChats[chatKey]) {
        mockChats[chatKey] = {
            userId: ownerId,
            tag: chatTag,
            name: seller.name,
            pic: seller.pic || seller.profilePic,
            verified: !!seller.verified,
            vip: !!(seller.vip || seller.isVip),
            messages: []
        };
    }
    activeChatTag = chatKey;
    renderMessagesList();
    await switchChat(chatKey);
}

function startChatWithListing(listingId) {
    const lid = Number(listingId) || 0;
    if (!lid) return;
    const item = listings.find((l) => Number(l?.id) === lid) || null;
    const ownerId = item?.owner_id || item?.ownerId || item?.seller?.id || '';
    if (!ownerId) {
        showToast('Seller not available', 'alert-circle');
        return;
    }
    return startChatWithSellerByOwnerId(String(ownerId), lid);
}

async function refreshUnreadMessageCount() {
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) {
        lastUnreadMessageCount = 0;
        setMessageBadge(0);
        return 0;
    }
    const { count, error } = await client
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', currentSupabaseUserId)
        .is('read_at', null);
    if (error) {
        if (handleAuthExpired(error)) return 0;
        if (!isMessagingBackendMissing(error)) showToast(error.message || 'Failed to load messages', 'alert-circle');
        setMessageBadge(0);
        return 0;
    }
    const n = Number(count) || 0;
    lastUnreadMessageCount = n;
    setMessageBadge(n);
    return n;
}

async function refreshLiveChatsFromSupabase() {
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) return;
    const selectWithMedia = 'id, created_at, sender_id, receiver_id, body, read_at, kind, media_url, media_name, media_mime, media_size';
    const selectTextOnly = 'id, created_at, sender_id, receiver_id, body, read_at';
    const query = (select) =>
        client
            .from('messages')
            .select(select)
            .or(`sender_id.eq.${currentSupabaseUserId},receiver_id.eq.${currentSupabaseUserId}`)
            .order('created_at', { ascending: true })
            .limit(200);

    let data = null;
    let error = null;
    if (messagesHasMediaColumns !== false) {
        const res = await query(selectWithMedia);
        data = res.data;
        error = res.error;
        if (error && (isMissingColumnError(error, 'kind') || isMissingColumnError(error, 'media_url'))) {
            messagesHasMediaColumns = false;
            const retry = await query(selectTextOnly);
            data = retry.data;
            error = retry.error;
        } else if (!error) {
            messagesHasMediaColumns = true;
        }
    } else {
        const res = await query(selectTextOnly);
        data = res.data;
        error = res.error;
    }

    if (error) {
        if (handleAuthExpired(error)) return;
        if (isMessagingBackendMissing(error)) {
            showToast('Messaging backend is not set up yet', 'alert-circle');
        } else {
            showToast(error.message || 'Failed to load messages', 'alert-circle');
        }
        return;
    }
    const rows = Array.isArray(data) ? data : [];
    const otherIds = new Set();
    rows.forEach((r) => {
        const otherId = r.sender_id === currentSupabaseUserId ? r.receiver_id : r.sender_id;
        if (otherId) otherIds.add(otherId);
    });
    const ids = Array.from(otherIds);
    const profilesById = ids.length ? await fetchProfilesByIds(ids) : {};
    const chats = {};
    ids.forEach((id) => {
        const p = profilesById[id];
        const seller = mapProfileRowToSeller(p?.id ? p : { id });
        const tag = seller.tag || `@${String(id).slice(0, 8)}`;
        const key = `id:${id}`;
        chats[key] = {
            userId: id,
            tag,
            name: seller.name,
            pic: seller.pic || seller.profilePic,
            verified: !!seller.verified,
            vip: !!(seller.vip || seller.isVip),
            messages: []
        };
    });
    rows.forEach((r) => {
        const otherId = r.sender_id === currentSupabaseUserId ? r.receiver_id : r.sender_id;
        const ownerTag = otherId ? `id:${otherId}` : null;
        if (!ownerTag) return;
        if (!chats[ownerTag]) return;
        const type = r.sender_id === currentSupabaseUserId ? 'sent' : 'received';
        const kind = r.kind || (r.media_url ? 'file' : 'text');
        const base = {
            id: r.id,
            type,
            kind,
            created_at: r.created_at,
            read_at: r.read_at,
            time: formatChatTime(r.created_at)
        };
        if (kind === 'text') {
            chats[ownerTag].messages.push({ ...base, text: r.body || '' });
            return;
        }
        chats[ownerTag].messages.push({
            ...base,
            url: r.media_url || '',
            name: r.media_name || '',
            mime: r.media_mime || ''
        });
    });
    mockChats = chats;
    if (activeChatTag && !mockChats[activeChatTag]) activeChatTag = null;
}

function setupMessagesRealtime() {
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) return;
    try {
        if (messagesRealtimeChannel) client.removeChannel(messagesRealtimeChannel);
    } catch (e) {
        null;
    }
    messagesRealtimeChannel = client
        .channel('messages-inbox')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${currentSupabaseUserId}` },
            async (payload) => {
                const row = payload?.new || null;
                if (!row) return;
                const isVisible = document.visibilityState === 'visible';
                const chatKey = row.sender_id ? `id:${row.sender_id}` : '';
                const isActiveChat = !!activeChatTag && chatKey && activeChatTag === chatKey;
                const isMessagesOpen = getActiveSectionId() === 'messages-section';

                if (isActiveChat) {
                    if (!isVisible) {
                        pendingActiveChatRefresh = true;
                        queuedIncomingActiveChatRows.push(row);
                    } else if (isMessagesOpen) {
                        applyIncomingRowsToActiveChat([row]);
                    }
                } else {
                    pendingMessagesInboxRefresh = true;
                }

                if (isVisible && isMessagesOpen) {
                    await refreshLiveChatsFromSupabase();
                    renderMessagesList();
                    pendingMessagesInboxRefresh = false;
                }

                await refreshUnreadMessageCount();
            }
        )
        .subscribe();
}

function setupMessagesPolling() {
    if (messagesPollTimer) {
        try {
            clearInterval(messagesPollTimer);
        } catch (e) {
            null;
        }
        messagesPollTimer = null;
    }
    if (DEMO_MODE) return;
    if (!currentSupabaseUserId) return;
    messagesPollTimer = setInterval(async () => {
        if (!currentSupabaseUserId) return;
        if (document.visibilityState !== 'visible') return;
        const prev = lastUnreadMessageCount;
        const next = await refreshUnreadMessageCount();
        if (next !== prev) {
            const isMessagesOpen = getActiveSectionId() === 'messages-section';
            if (isMessagesOpen) {
                await refreshLiveChatsFromSupabase();
                renderMessagesList();
                pendingMessagesInboxRefresh = false;
            } else {
                pendingMessagesInboxRefresh = true;
            }
        }
    }, 5000);
}

async function bootstrapMessages() {
    if (DEMO_MODE) {
        renderMessagesList();
        return;
    }
    if (!currentSupabaseUserId) {
        mockChats = {};
        activeChatTag = null;
        renderMessagesList();
        setMessageBadge(0);
        if (messagesPollTimer) {
            try {
                clearInterval(messagesPollTimer);
            } catch (e) {
                null;
            }
            messagesPollTimer = null;
        }
        return;
    }
    messagesIsLoading = true;
    renderMessagesList();
    try {
        await refreshLiveChatsFromSupabase();
        await refreshUnreadMessageCount();
    } finally {
        messagesIsLoading = false;
    }
    renderMessagesList();
    setupMessagesRealtime();
    setupMessagesPolling();
    if (activeChatTag) await switchChat(activeChatTag);
}

function getAnonVisitorId() {
    try {
        const key = 'winjayAnonVisitorIdV1';
        const existing = localStorage.getItem(key);
        if (existing) return existing;
        const id = crypto?.randomUUID ? crypto.randomUUID() : `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        localStorage.setItem(key, id);
        return id;
    } catch (e) {
        return `anon_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
}

function getCurrentSectionId() {
    const el = document.querySelector('.content-section.active');
    return el?.id || 'home-section';
}

function getDeviceInfo() {
    try {
        const ua = navigator.userAgent || '';
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (navigator.maxTouchPoints || 0) > 1;
        const w = window.screen?.width || window.innerWidth || 0;
        const h = window.screen?.height || window.innerHeight || 0;
        const lang = navigator.language || '';
        return {
            type: isMobile ? 'mobile' : 'desktop',
            ua: ua.slice(0, 220),
            screen: `${w}x${h}`,
            lang
        };
    } catch (e) {
        return { type: 'unknown' };
    }
}

function getAnalyticsSessionId() {
    try {
        const key = 'winjayAnalyticsSessionV1';
        const existing = sessionStorage.getItem(key);
        if (existing) return existing;
        const id = crypto?.randomUUID ? crypto.randomUUID() : `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
        sessionStorage.setItem(key, id);
        return id;
    } catch (e) {
        return `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    }
}

const analyticsDedupeKeys = new Set();
const analyticsQueue = [];
let analyticsGateOpen = false;
let analyticsGateSetup = false;
let analyticsBatch = [];
let analyticsBatchTimer = null;

function scheduleAnalyticsBatchFlush() {
    if (analyticsBatchTimer) return;
    analyticsBatchTimer = setTimeout(flushAnalyticsBatch, 2000);
}

async function flushAnalyticsBatch() {
    analyticsBatchTimer = null;
    if (!analyticsBatch.length) return;
    const items = analyticsBatch.splice(0);
    const client = initSupabase();
    if (!client) return;
    try {
        const { error } = await client.from('analytics_events').insert(items);
        if (error) {
            for (const item of items) {
                if (item && item.__dedupeKey) analyticsDedupeKeys.delete(item.__dedupeKey);
            }
        }
    } catch (e) {
        for (const item of items) {
            if (item && item.__dedupeKey) analyticsDedupeKeys.delete(item.__dedupeKey);
        }
    }
}

try {
    window.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden') flushAnalyticsBatch();
    });
} catch (e) {
    null;
}

function setupAnalyticsGate() {
    if (analyticsGateSetup) return;
    analyticsGateSetup = true;
    const open = () => {
        if (analyticsGateOpen) return;
        analyticsGateOpen = true;
        while (analyticsQueue.length) {
            const job = analyticsQueue.shift();
            if (!job) continue;
            sendAnalyticsEventNow(job.name, job.opts, job.key);
        }
    };
    try {
        window.addEventListener('pointerdown', open, { once: true, capture: true, passive: true });
    } catch (e) {
        null;
    }
    try {
        window.addEventListener('keydown', open, { once: true, capture: true });
    } catch (e) {
        null;
    }
    try {
        if (window.requestIdleCallback) window.requestIdleCallback(open, { timeout: 3500 });
    } catch (e) {
        null;
    }
    try {
        setTimeout(open, 3500);
    } catch (e) {
        null;
    }
}

async function sendAnalyticsEventNow(name, opts, key) {
    const payload = {
        event_name: name,
        user_id: currentSupabaseUserId || null,
        anon_id: currentSupabaseUserId ? null : getAnonVisitorId(),
        session_id: getAnalyticsSessionId(),
        section: getCurrentSectionId(),
        listing_id: Number.isFinite(Number(opts?.listingId)) ? Number(opts.listingId) : null,
        category: opts?.category ? String(opts.category) : null,
        wilaya: opts?.wilaya ? String(opts.wilaya) : null,
        device: getDeviceInfo(),
        meta: opts?.meta && typeof opts.meta === 'object' ? opts.meta : null
    };
    try {
        Object.defineProperty(payload, '__dedupeKey', { value: key, enumerable: false });
    } catch (e) {
        null;
    }
    analyticsBatch.push(payload);
    scheduleAnalyticsBatchFlush();
}

async function trackAnalyticsEvent(eventName, { listingId = null, category = null, wilaya = null, meta = null, dedupeKey = '' } = {}) {
    if (DEMO_MODE) return;
    const name = String(eventName || '').trim();
    if (!name) return;
    const key = dedupeKey ? String(dedupeKey) : `${name}:${listingId ?? ''}`;
    if (analyticsDedupeKeys.has(key)) return;
    analyticsDedupeKeys.add(key);
    setupAnalyticsGate();
    if (!analyticsGateOpen) {
        analyticsQueue.push({ name, key, opts: { listingId, category, wilaya, meta } });
        return;
    }
    sendAnalyticsEventNow(name, { listingId, category, wilaya, meta }, key);
}

function trackListingContactAction(kind, listingId) {
    const id = Number(listingId) || 0;
    const item = listings.find((l) => l.id === id);
    trackAnalyticsEvent('contact_click', {
        listingId: id || null,
        category: item?.category || null,
        wilaya: item?.wilaya || null,
        meta: { kind: String(kind || 'unknown') },
        dedupeKey: `contact_click:${String(kind || 'unknown')}:${id || ''}:${getAnalyticsSessionId()}`
    });
}

function updateLivePresence() {
    if (DEMO_MODE) return;
    const client = initSupabase();
    if (!client) return;
    if (!livePresenceChannel) return;
    const payload = {
        user_id: currentSupabaseUserId || null,
        section: getCurrentSectionId(),
        device: getDeviceInfo(),
        url: window.location.href,
        last_seen: new Date().toISOString()
    };
    try {
        livePresenceChannel.track(payload);
    } catch (e) {
        null;
    }
}

function bootstrapLivePresence() {
    if (DEMO_MODE) return;
    const client = initSupabase();
    if (!client) return;
    const key = currentSupabaseUserId || getAnonVisitorId();
    try {
        if (livePresenceChannel) client.removeChannel(livePresenceChannel);
    } catch (e) {
        null;
    }
    livePresenceChannel = client.channel('live-visitors', { config: { presence: { key } } });
    livePresenceChannel.on('presence', { event: 'sync' }, () => {
        updateAdminOnlineKpiValue();
        const adminOpen = document.getElementById('admin-dashboard-section')?.classList?.contains('active');
        if (adminOpen && adminActiveTab === 'live') renderAdminLiveVisitors();
    });
    livePresenceChannel.subscribe((status) => {
        if (status !== 'SUBSCRIBED') return;
        updateLivePresence();
    });
    if (livePresenceTimer) {
        try {
            clearInterval(livePresenceTimer);
        } catch (e) {
            null;
        }
        livePresenceTimer = null;
    }
    livePresenceTimer = setInterval(updateLivePresence, 15000);
}

function stopActiveVoicePlayback() {
    if (!activeVoiceAudio) return;
    activeVoiceAudio.pause();
    activeVoiceAudio.currentTime = 0;
    if (activeVoiceContainer) {
        setVoicePlayIcon(activeVoiceContainer, 'play');
        const fill = activeVoiceContainer.querySelector('.voice-wave-fill');
        if (fill) fill.style.width = '0%';
        const timeEl = activeVoiceContainer.querySelector('.voice-time');
        if (timeEl) timeEl.textContent = '0:00';
    }
    activeVoiceAudio = null;
    activeVoiceContainer = null;
    if (activeVoiceRafId) {
        try {
            cancelAnimationFrame(activeVoiceRafId);
        } catch (e) {
            null;
        }
        activeVoiceRafId = null;
    }
    scheduleLucideCreateIcons();
}

function getVoiceContainerById(voiceId) {
    return document.querySelector(`.voice-message[data-voice-id="${CSS.escape(voiceId)}"]`);
}

function setVoicePlayIcon(container, iconName) {
    const btn = container?.querySelector?.('.voice-play');
    if (!btn) return;
    btn.innerHTML = `<i data-lucide="${escapeHtml(String(iconName || 'play'))}"></i>`;
}

function syncVoiceUI(container, audio) {
    const fill = container.querySelector('.voice-wave-fill');
    const timeEl = container.querySelector('.voice-time');
    const duration = audio.duration || 0;
    const current = audio.currentTime || 0;
    if (fill) fill.style.width = duration > 0 ? `${(current / duration) * 100}%` : '0%';
    if (timeEl) timeEl.textContent = audio.paused ? formatTime(duration) : formatTime(current);
}

function startActiveVoiceRaf() {
    if (activeVoiceRafId) {
        try {
            cancelAnimationFrame(activeVoiceRafId);
        } catch (e) {
            null;
        }
        activeVoiceRafId = null;
    }
    const tick = () => {
        if (!activeVoiceAudio || !activeVoiceContainer) {
            activeVoiceRafId = null;
            return;
        }
        syncVoiceUI(activeVoiceContainer, activeVoiceAudio);
        if (!activeVoiceAudio.paused && !activeVoiceAudio.ended) {
            activeVoiceRafId = requestAnimationFrame(tick);
            return;
        }
        activeVoiceRafId = null;
    };
    activeVoiceRafId = requestAnimationFrame(tick);
}

function stopActiveVoiceRaf() {
    if (!activeVoiceRafId) return;
    try {
        cancelAnimationFrame(activeVoiceRafId);
    } catch (e) {
        null;
    }
    activeVoiceRafId = null;
}

function initVoiceMessage(container) {
    const audio = container.querySelector('.voice-audio');
    if (!audio) return;

    audio.onloadedmetadata = () => syncVoiceUI(container, audio);
    audio.ontimeupdate = () => syncVoiceUI(container, audio);
    audio.onplay = () => {
        setVoicePlayIcon(container, 'pause');
        activeVoiceAudio = audio;
        activeVoiceContainer = container;
        startActiveVoiceRaf();
        scheduleLucideCreateIcons();
    };
    audio.onpause = () => {
        if (activeVoiceAudio !== audio) return;
        setVoicePlayIcon(container, 'play');
        stopActiveVoiceRaf();
        syncVoiceUI(container, audio);
        scheduleLucideCreateIcons();
    };
    audio.onended = () => {
        setVoicePlayIcon(container, 'play');
        const fill = container.querySelector('.voice-wave-fill');
        if (fill) fill.style.width = '0%';
        const timeEl = container.querySelector('.voice-time');
        if (timeEl) timeEl.textContent = formatTime(audio.duration || 0);
        if (activeVoiceAudio === audio) {
            activeVoiceAudio = null;
            activeVoiceContainer = null;
        }
        stopActiveVoiceRaf();
        scheduleLucideCreateIcons();
    };
}

function initVoiceMessagesInChat(chatMessagesEl) {
    chatMessagesEl.querySelectorAll('.voice-message').forEach(initVoiceMessage);
}

function toggleVoicePlayback(voiceId) {
    const container = getVoiceContainerById(voiceId);
    if (!container) return;
    const audio = container.querySelector('.voice-audio');
    if (!audio) return;

    if (activeVoiceAudio && activeVoiceAudio !== audio) stopActiveVoicePlayback();

    if (audio.paused) {
        audio.play().then(() => {
            activeVoiceAudio = audio;
            activeVoiceContainer = container;
            setVoicePlayIcon(container, 'pause');
            startActiveVoiceRaf();
            scheduleLucideCreateIcons();
        }).catch(() => {
            showToast('Impossible de lire l’audio', 'alert-circle');
        });
    } else {
        audio.pause();
        setVoicePlayIcon(container, 'play');
        stopActiveVoiceRaf();
        scheduleLucideCreateIcons();
    }
}

function seekVoice(e, voiceId) {
    const container = getVoiceContainerById(voiceId);
    if (!container) return;
    const audio = container.querySelector('.voice-audio');
    if (!audio || !Number.isFinite(audio.duration) || audio.duration <= 0) return;

    const wave = container.querySelector('.voice-wave');
    if (!wave) return;
    const rect = wave.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = ratio * audio.duration;
    syncVoiceUI(container, audio);
}

function renderMessagesList() {
    const listEl = document.getElementById('messagesList');
    if (!listEl) return;

    if (messagesIsLoading && Object.keys(mockChats || {}).length === 0) {
        const items = Array.from({ length: 7 }).map(() => {
            return `
                <div class="message-item message-skeleton">
                    <div class="message-skeleton-avatar shimmer"></div>
                    <div class="message-info">
                        <div class="message-header">
                            <div class="message-title">
                                <div class="message-skeleton-line shimmer" style="width: 56%;"></div>
                                <div class="message-skeleton-line shimmer" style="width: 22%;"></div>
                            </div>
                            <div class="message-right">
                                <div class="message-skeleton-line shimmer" style="width: 42px;"></div>
                            </div>
                        </div>
                        <div class="message-skeleton-line shimmer" style="width: 82%; margin-top: 8px;"></div>
                    </div>
                </div>
            `;
        }).join('');
        listEl.innerHTML = `<div class="messages-skeleton-list">${items}</div>`;
        renderEmptyChat();
        return;
    }

    const entries = Object.entries(mockChats);
    const q = String(messagesListQuery || '').trim().toLowerCase();
    const filter = String(messagesListFilter || 'all');
    const enriched = entries
        .map(([tag, chat]) => {
            const last = chat.messages && chat.messages.length ? chat.messages[chat.messages.length - 1] : null;
            const preview = last ? getChatPreviewText(last) : 'Start the conversation';
            const unread = (chat.messages || []).some((m) => m?.type === 'received' && !m?.read_at);
            const displayTag = chat?.tag || tag;
            return { tag, chat, last, preview, unread, displayTag };
        })
        .filter((x) => {
            if (filter === 'unread' && !x.unread) return false;
            if (!q) return true;
            const hay = `${x.chat?.name || ''} ${x.displayTag || ''} ${x.preview || ''}`.toLowerCase();
            return hay.includes(q);
        })
        .sort((a, b) => String(b.last?.created_at || '').localeCompare(String(a.last?.created_at || '')));

    if (entries.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state" style="margin: 20px;">
                <i data-lucide="message-circle"></i>
                <h3>No messages yet</h3>
                <p>Start a conversation from a listing.</p>
            </div>
        `;
        renderEmptyChat();
        scheduleLucideCreateIcons(listEl);
        return;
    }
    if (enriched.length === 0) {
        listEl.innerHTML = `
            <div class="empty-state" style="margin: 20px;">
                <i data-lucide="search-x"></i>
                <h3>No results</h3>
                <p>Try a different search.</p>
            </div>
        `;
        scheduleLucideCreateIcons(listEl);
        return;
    }

    listEl.innerHTML = enriched
        .map(({ tag, chat, last, preview, unread, displayTag }) => {
            return `
                <div class="message-item ${tag === activeChatTag ? 'active' : ''} ${unread ? 'unread' : ''}" onclick="switchChat('${tag}')">
                    <img src="${chat.pic}" alt="">
                    <div class="message-info">
                        <div class="message-header">
                            <div class="message-title">
                                <span class="message-namewrap">
                                    <span class="message-name">${escapeHtml(chat.name)}</span>
                                    ${getUserBadgesHTML(chat)}
                                </span>
                                <span class="message-tag">${escapeHtml(displayTag)}</span>
                            </div>
                            <div class="message-right">
                                <span class="message-time">${escapeHtml(last?.time || '')}</span>
                                ${unread ? '<span class="unread-dot"></span>' : ''}
                            </div>
                        </div>
                        <p class="message-preview">${escapeHtml(preview)}</p>
                    </div>
                </div>
            `;
        })
        .join('');

    scheduleLucideCreateIcons(listEl);
}

function setupMessagesTwitterUI() {
    const filterBtn = document.getElementById('messagesFilterBtn');
    const filterMenu = document.getElementById('messagesFilterMenu');
    const filterLabel = document.getElementById('messagesFilterLabel');
    const searchInput = document.getElementById('messagesSearchInput');
    const composeBtn = document.getElementById('messagesComposeBtn');

    if (searchInput && !searchInput.dataset.bound) {
        searchInput.dataset.bound = '1';
        searchInput.addEventListener('input', () => {
            messagesListQuery = String(searchInput.value || '');
            renderMessagesList();
        });
    }

    if (filterBtn && filterMenu && !filterBtn.dataset.bound) {
        filterBtn.dataset.bound = '1';
        filterBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const next = !filterMenu.classList.contains('active');
            filterMenu.classList.toggle('active', next);
        });
        filterMenu.querySelectorAll('.messages-filter-item').forEach((btn) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const next = btn.getAttribute('data-filter') || 'all';
                messagesListFilter = next;
                filterMenu.classList.remove('active');
                filterMenu.querySelectorAll('.messages-filter-item').forEach((b) => b.classList.remove('active'));
                btn.classList.add('active');
                if (filterLabel) filterLabel.textContent = next === 'unread' ? 'Unread' : 'All';
                renderMessagesList();
            });
        });
        document.addEventListener('click', () => {
            filterMenu.classList.remove('active');
        });
    }

    if (composeBtn && !composeBtn.dataset.bound) {
        composeBtn.dataset.bound = '1';
        composeBtn.addEventListener('click', () => {
            if (!requireAuthOrPrompt()) return;
            openModal('newMessageModal');
            setTimeout(() => document.getElementById('newMessageUsername')?.focus?.(), 50);
        });
    }
}

function startNewMessageFromModal() {
    if (!requireAuthOrPrompt()) return;
    const input = document.getElementById('newMessageUsername');
    const raw = String(input?.value || '').trim();
    if (!raw) {
        showToast('Enter a username', 'alert-circle');
        return;
    }
    const tag = raw.startsWith('@') ? raw : '@' + raw;
    closeModal('newMessageModal');
    startChatWithSeller(tag);
    if (input) input.value = '';
}

function renderEmptyChat() {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    const header = chatArea.querySelector('.chat-header');
    const messages = document.getElementById('chatMessages');
    if (header) {
        header.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px; padding: 12px 14px;">
                <i data-lucide="message-circle"></i>
                <div style="font-weight:800;">Messages</div>
            </div>
        `;
    }
    if (messages) {
        messages.innerHTML = `
            <div class="empty-state" style="padding: 28px 16px;">
                <i data-lucide="message-square"></i>
                <h3>Select a chat</h3>
                <p>Your conversation will appear here.</p>
            </div>
        `;
    }
    const input = document.getElementById('chatInput');
    if (input) {
        input.value = '';
        input.disabled = true;
    }
    const sendBtn = document.getElementById('chatSendBtn');
    if (sendBtn) sendBtn.disabled = true;
    const plusBtn = document.getElementById('chatPlusBtn');
    if (plusBtn) plusBtn.disabled = true;
    const micBtn = document.getElementById('chatMicBtn');
    if (micBtn) micBtn.disabled = true;
}

async function startChatWithSeller(tag, { pushState = false } = {}) {
    if (!tag) return;

    if (!requireAuthOrPrompt()) return;

    if (!DEMO_MODE) {
        const profileRow = await fetchProfileByTag(tag);
        if (!profileRow?.id) {
            showToast('User not found', 'alert-circle');
            return;
        }
        const seller = mapProfileRowToSeller(profileRow);
        const normalizedTag = seller.tag || (String(tag).startsWith('@') ? tag : '@' + tag);
        const chatKey = `id:${profileRow.id}`;
        suppressNextMessagesBootstrap = true;
        showSection('messages-section');
        if (pushState) {
            setChatRouteParam(true, {
                replace: false,
                state: { __winjay: true, view: 'messages', from: 'course', courseId: String(activeCourseId || '') || null }
            });
        }
        await bootstrapMessages();
        if (!mockChats[chatKey]) {
            mockChats[chatKey] = {
                userId: profileRow.id,
                tag: normalizedTag,
                name: seller.name,
                pic: seller.pic || seller.profilePic,
                verified: !!seller.verified,
                vip: !!(seller.vip || seller.isVip),
                messages: []
            };
        }
        activeChatTag = chatKey;
        renderMessagesList();
        await switchChat(chatKey);
        return;
    }

    if (!mockChats[tag]) {
        const seller =
            botProfiles.find(p => p.tag === tag) ||
            reviewers.find(p => p.tag === tag) ||
            (userProfile.tag === tag ? userProfile : null);

        mockChats[tag] = {
            name: seller?.name || 'Seller',
            pic: seller?.pic || seller?.profilePic || DEFAULT_AVATAR_SVG,
            verified: !!seller?.verified,
            vip: !!(seller?.vip || seller?.isVip),
            messages: []
        };
    }

    activeChatTag = tag;
    showSection('messages-section');
    if (pushState) {
        setChatRouteParam(true, {
            replace: false,
            state: { __winjay: true, view: 'messages', from: 'course', courseId: String(activeCourseId || '') || null }
        });
    }
    renderMessagesList();
    switchChat(tag);
}

async function switchChat(tag, isModal = false, { skipFetch = false } = {}) {
    const chat = mockChats[tag];
    if (!chat) {
        activeChatTag = null;
        renderEmptyChat();
        scheduleLucideCreateIcons(document.getElementById('messages-section') || document.body);
        return;
    }

    closeChatActions();
    const previousActiveChatTag = activeChatTag;
    activeChatTag = tag;
    const voiceSnapshot = previousActiveChatTag === tag ? snapshotActiveVoicePlayback() : null;
    if (previousActiveChatTag !== tag) stopActiveVoicePlayback();

    if (!skipFetch && !DEMO_MODE && currentSupabaseUserId && chat.userId) {
        const client = initSupabase();
        if (client) {
            const selectWithMedia = 'id, created_at, sender_id, receiver_id, body, read_at, kind, media_url, media_name, media_mime, media_size';
            const selectTextOnly = 'id, created_at, sender_id, receiver_id, body, read_at';
            const query = (select) =>
                client
                    .from('messages')
                    .select(select)
                    .or(`and(sender_id.eq.${currentSupabaseUserId},receiver_id.eq.${chat.userId}),and(sender_id.eq.${chat.userId},receiver_id.eq.${currentSupabaseUserId})`)
                    .order('created_at', { ascending: true })
                    .limit(120);

            let data = null;
            let error = null;
            if (messagesHasMediaColumns !== false) {
                const res = await query(selectWithMedia);
                data = res.data;
                error = res.error;
                if (error && (isMissingColumnError(error, 'kind') || isMissingColumnError(error, 'media_url'))) {
                    messagesHasMediaColumns = false;
                    const retry = await query(selectTextOnly);
                    data = retry.data;
                    error = retry.error;
                } else if (!error) {
                    messagesHasMediaColumns = true;
                }
            } else {
                const res = await query(selectTextOnly);
                data = res.data;
                error = res.error;
            }
            if (!error) {
                chat.messages = (Array.isArray(data) ? data : []).map((r) => {
                    const kind = r.kind || (r.media_url ? 'file' : 'text');
                    const out = {
                        id: r.id,
                        type: r.sender_id === currentSupabaseUserId ? 'sent' : 'received',
                        kind,
                        created_at: r.created_at,
                        read_at: r.read_at,
                        time: formatChatTime(r.created_at)
                    };
                    if (kind === 'text') return { ...out, text: r.body || '' };
                    return { ...out, url: r.media_url || '', name: r.media_name || '', mime: r.media_mime || '' };
                });
            } else {
                if (handleAuthExpired(error)) return;
                if (!isMessagingBackendMissing(error)) showToast(error.message || 'Failed to load messages', 'alert-circle');
            }
            await client
                .from('messages')
                .update({ read_at: new Date().toISOString() })
                .eq('receiver_id', currentSupabaseUserId)
                .eq('sender_id', chat.userId)
                .is('read_at', null);
            await refreshUnreadMessageCount();
        }
    }

    const prefix = isModal ? "Modal" : "";
    const chatArea = document.getElementById(`chatArea${prefix}`);
    if (!chatArea) return;
    const chatHeader = chatArea.querySelector('.chat-header');
    const chatMessages = document.getElementById(`chatMessages${prefix}`);
    const messageItems = document.querySelectorAll(`.message-item${isModal ? '-modal' : ''}`);
    const isSameChat = previousActiveChatTag === tag;
    const prevScrollTop = chatMessages ? chatMessages.scrollTop : 0;
    const wasNearBottom =
        !!chatMessages &&
        (!isSameChat || (chatMessages.scrollHeight - (chatMessages.scrollTop + chatMessages.clientHeight) < 120));
    if (!isSameChat) chatUnseenNewCount = 0;
    const prevRenderedCount = renderedChatMessageCounts.get(tag) || 0;

    if (chat.messages) {
        chat.messages.forEach(m => {
            if (!m.id) m.id = newMessageId();
        });
    }
    const pending = getPendingChatMessages(tag);
    if (pending.length) {
        const existingIds = new Set((chat.messages || []).map((m) => String(m?.id || '')));
        pending.forEach((m) => {
            if (!m || !m.id) return;
            if (existingIds.has(String(m.id))) return;
            chat.messages.push(m);
        });
        chat.messages.sort((a, b) => String(a?.created_at || '').localeCompare(String(b?.created_at || '')));
    }

    const displayTag = chat?.tag || tag;
    chatHeader.innerHTML = `
        <button class="chat-mobile-back" type="button" onclick="event.stopPropagation(); closeChatMobile();">
            <i data-lucide="arrow-left"></i>
        </button>
        <img src="${chat.pic}" alt="" id="chatUserPic" onclick="viewChatUserProfile('${tag}')" style="cursor: pointer;">
        <div onclick="viewChatUserProfile('${tag}')" style="cursor: pointer; flex: 1;">
            <h4>${chat.name} ${getUserBadgesHTML(chat)}</h4>
            <span id="chatUserTag">${displayTag}</span>
        </div>
        <button class="chat-more-btn" onclick="event.stopPropagation(); openBlockModal();">
            <i data-lucide="more-horizontal"></i>
        </button>
    `;

    chatMessages.innerHTML = chat.messages.map(m => {
        const indicatorName = getChatSentIndicatorIconName(m);
        const indicatorHTML = indicatorName
            ? `<span class="chat-indicator ${escapeHtml(String(m.status || 'sent'))}"><i data-lucide="${escapeHtml(indicatorName)}"></i></span>`
            : '';
        const metaInner = `<span class="chat-time">${escapeHtml(m.time || '')}</span>${indicatorHTML}`;
        const isMedia = !!(m.kind && m.kind !== 'text');
        const metaHTML = isMedia ? metaInner : `<div class="chat-meta">${metaInner}</div>`;
        const retryHTML = String(m.status || '') === 'failed'
            ? `<button type="button" class="chat-retry-btn" onclick="retryChatMessage('${escapeHtml(String(m.id || ''))}')">Retry</button>`
            : '';
        const kindClass = (m.kind && m.kind !== 'text') ? `has-media kind-${escapeHtml(String(m.kind))}` : '';
        const statusClass = m.status ? `msg-${escapeHtml(String(m.status))}` : '';
        return `
            <div class="chat-message ${escapeHtml(m.type || '')} ${kindClass} ${statusClass}" data-message-id="${escapeHtml(String(m.id || ''))}">
                ${renderChatMessageBody(m, isMedia ? metaHTML : '')}
                ${isMedia ? '' : metaHTML}
                ${retryHTML}
            </div>
        `;
    }).join('');
    if (!isModal) renderMessagesList();
    initVoiceMessagesInChat(chatMessages);
    initChatVideoThumbsInChat(chatMessages);
    if (voiceSnapshot) restoreVoicePlayback(voiceSnapshot);

    if (wasNearBottom) {
        stickChatToBottom(chatMessages, { force: true, attempts: 3 });
    } else {
        chatMessages.scrollTop = prevScrollTop;
    }
    bindChatAutoStickToBottom(chatMessages, { force: wasNearBottom });
    renderedChatMessageCounts.set(tag, Array.isArray(chat.messages) ? chat.messages.length : 0);
    if (isSameChat) {
        const nextCount = renderedChatMessageCounts.get(tag) || 0;
        const delta = Math.max(0, nextCount - prevRenderedCount);
        if (delta > 0 && !wasNearBottom) chatUnseenNewCount += delta;
    }
    if (!isModal) updateChatJumpLatestButton();
    if (!isModal) {
        document.querySelector('#messages-section .messages-twitter')?.classList?.add('chat-open');
    }
    const input = document.getElementById(`chatInput${prefix}`);
    if (input) input.disabled = false;
    const sendBtn = document.getElementById(`chatSendBtn${prefix}`);
    if (sendBtn) sendBtn.disabled = false;
    const plusBtn = document.getElementById(`chatPlusBtn${prefix}`);
    if (plusBtn) plusBtn.disabled = false;
    const micBtn = document.getElementById(`chatMicBtn${prefix}`);
    if (micBtn) micBtn.disabled = false;
    scheduleLucideCreateIcons(chatArea);
}

function initChatVideoThumbsInChat(chatMessagesEl) {
    if (!chatMessagesEl) return;
    chatMessagesEl.querySelectorAll('.chat-video-thumb').forEach((wrap) => {
        const video = wrap.querySelector('video');
        const durationEl = wrap.querySelector('.chat-video-duration');
        if (!video || !durationEl) return;
        if (video.dataset.boundDuration) return;
        video.dataset.boundDuration = '1';
        video.onloadedmetadata = () => {
            try {
                durationEl.textContent = formatTime(video.duration || 0);
            } catch (e) {
                durationEl.textContent = '0:00';
            }
        };
    });
}

function closeChatMobile() {
    document.querySelector('#messages-section .messages-twitter')?.classList?.remove('chat-open');
}

function viewChatUserProfile(tag) {
    if (!tag) return;
    const chat = mockChats?.[tag] || null;
    if (chat?.userId) {
        openSellerProfileByOwnerId(chat.userId);
        return;
    }
    openSellerProfile(tag);
}

let currentFilters = {
    search: '',
    category: '',
    subcategory: '',
    wilaya: '',
    priceMin: '',
    priceMax: '',
    sort: 'newest'
};

const wilayas = [
    "01 Adrar", "02 Chlef", "03 Laghouat", "04 Oum El Bouaghi", "05 Batna", "06 Béjaïa", "07 Biskra", "08 Béchar",
    "09 Blida", "10 Bouira", "11 Tamanrasset", "12 Tébessa", "13 Tlemcen", "14 Tiaret", "15 Tizi Ouzou", "16 Alger",
    "17 Djelfa", "18 Jijel", "19 Sétif", "20 Saïda", "21 Skikda", "22 Sidi Bel Abbès", "23 Annaba", "24 Guelma",
    "25 Constantine", "26 Médéa", "27 Mostaganem", "28 M'Sila", "29 Mascara", "30 Ouargla", "31 Oran", "32 El Bayadh",
    "33 Illizi", "34 Bordj Bou Arreridj", "35 Boumerdès", "36 El Tarf", "37 Tindouf", "38 Tissemsilt", "39 El Oued",
    "40 Khenchela", "41 Souk Ahras", "42 Tipaza", "43 Mila", "44 Aïn Defla", "45 Naâma", "46 Aïn Témouchent", "47 Ghardaïa",
    "48 Relizane", "49 El M'Ghair", "50 El Meniaa", "51 Ouled Djellal", "52 Bordj Baji Mokhtar", "53 Béni Abbès",
    "54 Timimoun", "55 Touggourt", "56 Djanet", "57 In Salah", "58 In Guezzam"
];

const categories = [
    { name: "Boutiques", icon: "store" },
    { name: "Immobilier", icon: "home" },
    { name: "Automobiles & Véhicules", icon: "car" },
    { name: "Pièces détachées", icon: "settings" },
    { name: "Téléphones & Accessoires", icon: "phone" },
    { name: "Informatique", icon: "monitor" },
    { name: "Électroménager & Électronique", icon: "tv" },
    { name: "Vêtements & Mode", icon: "shopping-bag" },
    { name: "Santé & Beauté", icon: "heart-pulse" },
    { name: "Meubles & Maison", icon: "armchair" },
    { name: "Loisirs & Divertissements", icon: "palmtree" },
    { name: "Sport", icon: "trophy" },
    { name: "Emploi", icon: "briefcase" },
    { name: "Hébergement", icon: "bed-double" },
    { name: "Matériaux & Équipement", icon: "wrench" },
    { name: "Alimentaires", icon: "utensils" },
    { name: "Voyages", icon: "plane" },
    { name: "Services", icon: "user-cog" }
];

const listingSubcategoriesByCategory = {
    "Boutiques": ["Magasins & showrooms", "Restaurants & cafés", "Épiceries & supérettes", "Services professionnels", "Autres boutiques"],
    "Immobilier": ["Vente", "Location", "Location vacances", "Colocation", "Terrains", "Locaux commerciaux", "Bureaux", "Cherche achat", "Cherche location"],
    "Automobiles & Véhicules": ["Voitures", "Motos & Scooters", "Camions & Utilitaires", "Bus & Minibus", "Engins & Machines", "Location de voitures"],
    "Pièces détachées": ["Pièces auto", "Pièces moto", "Pneus & jantes", "Batteries", "Accessoires", "Huiles & entretien"],
    "Téléphones & Accessoires": ["Smartphones", "Téléphones simples", "Tablettes", "Accessoires (chargeur/écouteurs)", "Réparation"],
    "Informatique": ["PC Portables", "PC Bureau", "Composants (GPU/CPU/RAM)", "Écrans", "Réseaux", "Stockage (SSD/HDD)", "Logiciels"],
    "Électroménager & Électronique": ["TV & Audio", "Photo & Caméras", "Consoles & Jeux", "Électroménager", "Imprimantes", "Accessoires"],
    "Vêtements & Mode": ["Vêtements", "Chaussures", "Sacs", "Montres", "Bijoux", "Vêtements bébé & enfant"],
    "Santé & Beauté": ["Parfums & Cosmétiques", "Matériel médical", "Bien-être", "Compléments", "Coiffure & esthétique"],
    "Meubles & Maison": ["Meubles", "Décoration", "Cuisine", "Linge de maison", "Bricolage/Outillage", "Jardinage"],
    "Loisirs & Divertissements": ["Livres", "Jeux & jouets", "Musique & instruments", "Billetterie", "Art & collection", "Animaux"],
    "Sport": ["Matériel sport", "Vélos", "Fitness", "Sport collectif", "Sports de combat"],
    "Emploi": ["Offres d’emploi", "Recherche d’emploi", "Stages", "Intérim"],
    "Hébergement": ["Hôtel", "Auberge", "Maison d'hôtes", "Résidence", "Appartement", "Villa de vacances", "Autre"],
    "Matériaux & Équipement": ["Construction/BTP", "Industrie", "Agriculture", "Restauration (café/hôtel)", "Matériel bureau", "Énergie", "Transport & Logistique"],
    "Alimentaires": ["Fruits & légumes", "Viandes & poissons", "Pâtisserie", "Boissons", "Produits maison", "Autres alimentaires"],
    "Voyages": ["Agences & packs", "Omra & Hadj", "Billets & transport", "Hôtels", "Excursions", "Location saisonnière"],
    "Services": ["Services à domicile", "Cours & formations", "Transport", "Événementiel", "Freelance", "Réparation", "Services à la personne"]
};

let businessCategoriesById = {};

const allExtraCategories = [];

const CATEGORY_LABELS = {
    "Boutiques": { fr: "Boutiques", en: "Shops", ar: "متاجر" },
    "Immobilier": { fr: "Immobilier", en: "Real Estate", ar: "عقارات" },
    "Automobiles & Véhicules": { fr: "Automobiles & Véhicules", en: "Cars & Vehicles", ar: "سيارات ومركبات" },
    "Pièces détachées": { fr: "Pièces détachées", en: "Spare parts", ar: "قطع غيار" },
    "Téléphones & Accessoires": { fr: "Téléphones & Accessoires", en: "Phones & Accessories", ar: "هواتف وإكسسوارات" },
    "Informatique": { fr: "Informatique", en: "Computers & IT", ar: "حواسيب ومعلوماتية" },
    "Électroménager & Électronique": { fr: "Électroménager & Électronique", en: "Appliances & Electronics", ar: "أجهزة منزلية وإلكترونيات" },
    "Vêtements & Mode": { fr: "Vêtements & Mode", en: "Fashion & Clothing", ar: "ملابس وموضة" },
    "Santé & Beauté": { fr: "Santé & Beauté", en: "Health & Beauty", ar: "صحة وجمال" },
    "Meubles & Maison": { fr: "Meubles & Maison", en: "Furniture & Home", ar: "أثاث ومنزل" },
    "Loisirs & Divertissements": { fr: "Loisirs & Divertissements", en: "Leisure & Entertainment", ar: "ترفيه وهوايات" },
    "Sport": { fr: "Sport", en: "Sports", ar: "رياضة" },
    "Emploi": { fr: "Emploi", en: "Jobs", ar: "وظائف" },
    "Hébergement": { fr: "Hébergement", en: "Accommodation", ar: "إقامة" },
    "Matériaux & Équipement": { fr: "Matériaux & Équipement", en: "Materials & Equipment", ar: "مواد ومعدات" },
    "Alimentaires": { fr: "Alimentaires", en: "Food", ar: "مواد غذائية" },
    "Voyages": { fr: "Voyages", en: "Travel", ar: "سفر" },
    "Services": { fr: "Services", en: "Services", ar: "خدمات" }
};

const WORK_CATEGORY_TO_LISTING = {
    // Hôtellerie & Tourisme
    'Hôtel': { category: 'Hébergement', subcategory: 'Hôtel' },
    'Auberge': { category: 'Hébergement', subcategory: 'Auberge' },
    'Maison d\'hôtes': { category: 'Hébergement', subcategory: 'Maison d\'hôtes' },
    'Resort': { category: 'Hébergement', subcategory: 'Villa de vacances' },
    'Agence de voyage': { category: 'Voyages', subcategory: 'Agences & packs' },
    'Guide touristique': { category: 'Voyages', subcategory: 'Excursions' },
    // Restauration & Boissons
    'Restaurant': { category: 'Boutiques', subcategory: 'Restaurants & cafés' },
    'Fast-food': { category: 'Boutiques', subcategory: 'Restaurants & cafés' },
    'Café': { category: 'Boutiques', subcategory: 'Restaurants & cafés' },
    'Boulangerie / Pâtisserie': { category: 'Boutiques', subcategory: 'Restaurants & cafés' },
    'Traiteur': { category: 'Boutiques', subcategory: 'Restaurants & cafés' },
    'Food truck': { category: 'Boutiques', subcategory: 'Restaurants & cafés' },
    'Boucherie / Charcuterie': { category: 'Alimentaires', subcategory: 'Viandes & poissons' },
    'Épicerie / Supérette': { category: 'Boutiques', subcategory: 'Épiceries & supérettes' },
    'Glacier / Jus': { category: 'Boutiques', subcategory: 'Restaurants & cafés' },
    // Automobile & Transport
    'Garage / Mécanique': { category: 'Automobiles & Véhicules', subcategory: 'Voitures' },
    'Carrosserie / Peinture': { category: 'Automobiles & Véhicules', subcategory: 'Voitures' },
    'Lavage auto': { category: 'Automobiles & Véhicules', subcategory: 'Voitures' },
    'Pneumatiques': { category: 'Pièces détachées', subcategory: 'Pneus & jantes' },
    'Pièces auto': { category: 'Pièces détachées', subcategory: 'Pièces auto' },
    'Remorquage': { category: 'Automobiles & Véhicules', subcategory: 'Voitures' },
    'Location de voiture': { category: 'Automobiles & Véhicules', subcategory: 'Location de voitures' },
    // Construction & BTP
    'Entreprise de construction': { category: 'Matériaux & Équipement', subcategory: 'Construction/BTP' },
    'Plomberie': { category: 'Services', subcategory: 'Services à domicile' },
    'Électricité': { category: 'Services', subcategory: 'Services à domicile' },
    'Climatisation / HVAC': { category: 'Services', subcategory: 'Services à domicile' },
    'Menuiserie': { category: 'Services', subcategory: 'Services à domicile' },
    'Maçonnerie': { category: 'Matériaux & Équipement', subcategory: 'Construction/BTP' },
    'Peinture': { category: 'Services', subcategory: 'Services à domicile' },
    'Toiture': { category: 'Matériaux & Équipement', subcategory: 'Construction/BTP' },
    'Soudure': { category: 'Matériaux & Équipement', subcategory: 'Construction/BTP' },
    'Aluminium / Vitrerie': { category: 'Matériaux & Équipement', subcategory: 'Construction/BTP' },
    // Services à domicile
    'Nettoyage': { category: 'Services', subcategory: 'Services à domicile' },
    'Déménagement': { category: 'Services', subcategory: 'Transport' },
    'Jardinage': { category: 'Services', subcategory: 'Services à personne' },
    'Lutte antiparasitaire': { category: 'Services', subcategory: 'Services à la personne' },
    // Santé & Médical
    'Cabinet médical': { category: 'Santé & Beauté', subcategory: 'Matériel médical' },
    'Clinique': { category: 'Santé & Beauté', subcategory: 'Matériel médical' },
    'Dentiste': { category: 'Santé & Beauté', subcategory: 'Matériel médical' },
    'Laboratoire': { category: 'Santé & Beauté', subcategory: 'Matériel médical' },
    'Opticien': { category: 'Santé & Beauté', subcategory: 'Bien-être' },
    'Pharmacie / Parapharmacie': { category: 'Santé & Beauté', subcategory: 'Parfums & Cosmétiques' },
    'Kinésithérapie': { category: 'Santé & Beauté', subcategory: 'Bien-être' },
    // Beauté & Bien-être
    'Salon de coiffure': { category: 'Santé & Beauté', subcategory: 'Coiffure & esthétique' },
    'Barber': { category: 'Santé & Beauté', subcategory: 'Coiffure & esthétique' },
    'Spa / Hammam': { category: 'Santé & Beauté', subcategory: 'Bien-être' },
    'Esthétique / Soins': { category: 'Santé & Beauté', subcategory: 'Coiffure & esthétique' },
    'Onglerie': { category: 'Santé & Beauté', subcategory: 'Coiffure & esthétique' },
    'Maquillage': { category: 'Santé & Beauté', subcategory: 'Coiffure & esthétique' },
    // Éducation & Formation
    'École privée': { category: 'Services', subcategory: 'Cours & formations' },
    'Soutien scolaire': { category: 'Services', subcategory: 'Cours & formations' },
    'Centre de formation': { category: 'Services', subcategory: 'Cours & formations' },
    'École de langues': { category: 'Services', subcategory: 'Cours & formations' },
    'Auto-école': { category: 'Services', subcategory: 'Cours & formations' },
    // Informatique & Digital
    'Développement web / app': { category: 'Services', subcategory: 'Freelance' },
    'Réparation informatique': { category: 'Services', subcategory: 'Réparation' },
    'Réseaux / Sécurité': { category: 'Services', subcategory: 'Freelance' },
    'Design graphique': { category: 'Services', subcategory: 'Freelance' },
    'Marketing digital': { category: 'Services', subcategory: 'Freelance' },
    'Imprimerie': { category: 'Matériaux & Équipement', subcategory: 'Matériel bureau' },
    // Commerce & Boutiques
    'Boutique vêtements': { category: 'Vêtements & Mode', subcategory: 'Vêtements' },
    'Boutique électronique': { category: 'Électroménager & Électronique', subcategory: 'Électroménager' },
    'Boutique téléphonie': { category: 'Téléphones & Accessoires', subcategory: 'Smartphones' },
    'Meubles / Déco': { category: 'Meubles & Maison', subcategory: 'Meubles' },
    'Quincaillerie': { category: 'Matériaux & Équipement', subcategory: 'Construction/BTP' },
    'Cosmétique / Parfum': { category: 'Santé & Beauté', subcategory: 'Parfums & Cosmétiques' },
    'Librairie': { category: 'Loisirs & Divertissements', subcategory: 'Livres' },
    'Animalerie': { category: 'Loisirs & Divertissements', subcategory: 'Animaux' },
    // Services professionnels
    'Comptabilité': { category: 'Services', subcategory: 'Freelance' },
    'Juridique': { category: 'Services', subcategory: 'Freelance' },
    'Assurance': { category: 'Services', subcategory: 'Freelance' },
    'Conseil': { category: 'Services', subcategory: 'Freelance' },
    'Traduction': { category: 'Services', subcategory: 'Freelance' },
    // Logistique
    'Livraison / Coursier': { category: 'Services', subcategory: 'Transport' },
    'Transport de marchandises': { category: 'Automobiles & Véhicules', subcategory: 'Camions & Utilitaires' },
    'Entrepôt': { category: 'Immobilier', subcategory: 'Locaux commerciaux' },
    // Industrie & Fabrication
    'Atelier': { category: 'Matériaux & Équipement', subcategory: 'Industrie' },
    'Usine': { category: 'Matériaux & Équipement', subcategory: 'Industrie' },
    'Métallerie': { category: 'Matériaux & Équipement', subcategory: 'Construction/BTP' },
    'Menuiserie industrielle': { category: 'Matériaux & Équipement', subcategory: 'Industrie' },
    'Textile': { category: 'Vêtements & Mode', subcategory: 'Vêtements' },
    // Agriculture & Animaux
    'Ferme': { category: 'Alimentaires', subcategory: 'Fruits & légumes' },
    'Pépinière': { category: 'Alimentaires', subcategory: 'Fruits & légumes' },
    'Fournitures agricoles': { category: 'Matériaux & Équipement', subcategory: 'Agriculture' },
    'Vétérinaire': { category: 'Services', subcategory: 'Services à la personne' },
    // Sport & Loisirs
    'Salle de sport': { category: 'Sport', subcategory: 'Fitness' },
    'Club sportif': { category: 'Sport', subcategory: 'Sport collectif' },
    'Coach': { category: 'Services', subcategory: 'Cours & formations' },
    // Événementiel
    'Photographe': { category: 'Services', subcategory: 'Événementiel' },
    'Vidéaste': { category: 'Services', subcategory: 'Événementiel' },
    'DJ': { category: 'Services', subcategory: 'Événementiel' },
    'Organisation événements': { category: 'Services', subcategory: 'Événementiel' }
};

let homeCategorySwipeMode = 'main';
let homeCategorySwipeMainCategory = '';

function getCategoryLabel(name) {
    const cat = String(name || '').trim();
    const entry = CATEGORY_LABELS[cat] || null;
    if (!entry) return cat;
    return entry[currentLang] || entry.fr || cat;
}

function setupHomeCategorySwipe() {
    const wrap = document.getElementById('homeCategorySwipe');
    const listEl = document.getElementById('homeCategorySwipeList');
    const titleEl = document.getElementById('homeCategorySwipeTitle');
    const backEl = document.getElementById('homeCategorySwipeBack');
    if (!wrap || !listEl || !titleEl || !backEl) return;

    if (!wrap.dataset.bound) {
        wrap.dataset.bound = '1';

        backEl.addEventListener('click', () => {
            homeCategorySwipeMode = 'main';
            currentFilters.subcategory = '';
            updateActiveFilters();
            renderListings();
            renderHomeCategorySwipe();
        });

        listEl.addEventListener('click', (e) => {
            const btn = e.target?.closest?.('.home-category-swipe-item');
            if (!btn) return;
            const main = btn.getAttribute('data-main') || '';
            const sub = btn.getAttribute('data-sub') || '';

            if (homeCategorySwipeMode === 'main') {
                homeCategorySwipeMainCategory = main;
                filterByCategory(main, null);
                const subs = Array.isArray(listingSubcategoriesByCategory[main]) ? listingSubcategoriesByCategory[main] : [];
                if (subs.length) {
                    homeCategorySwipeMode = 'sub';
                    renderHomeCategorySwipe();
                }
                return;
            }

            if (homeCategorySwipeMode === 'sub') {
                currentFilters.category = homeCategorySwipeMainCategory || currentFilters.category;
                document.getElementById('filterCategory').value = currentFilters.category;
                currentFilters.subcategory = sub;
                applyFilters();
                renderHomeCategorySwipe();
            }
        });
    }

    renderHomeCategorySwipe();
}

function renderHomeCategorySwipe() {
    const listEl = document.getElementById('homeCategorySwipeList');
    const titleEl = document.getElementById('homeCategorySwipeTitle');
    const backEl = document.getElementById('homeCategorySwipeBack');
    if (!listEl || !titleEl || !backEl) return;

    if (!homeCategorySwipeMode || homeCategorySwipeMode === 'main') {
        homeCategorySwipeMode = 'main';
        titleEl.textContent = t('home_categories_title');
        backEl.style.display = 'none';
        const active = String(currentFilters.category || '').trim();
        listEl.innerHTML = categories.map((c) => {
            const label = getCategoryLabel(c.name);
            const isActive = active === c.name ? 'active' : '';
            return `<button type="button" class="home-category-swipe-item ${isActive}" data-main="${escapeHtml(c.name)}"><i data-lucide="${escapeHtml(c.icon)}"></i><span class="home-category-swipe-label">${escapeHtml(label)}</span></button>`;
        }).join('');
        scheduleLucideCreateIcons(listEl);
        return;
    }

    if (homeCategorySwipeMode === 'sub') {
        const main = homeCategorySwipeMainCategory || currentFilters.category;
        const mainIcon = categories.find((c) => c.name === main)?.icon || 'grid';
        titleEl.textContent = getCategoryLabel(main);
        backEl.textContent = t('home_categories_back');
        backEl.style.display = '';
        const subs = Array.isArray(listingSubcategoriesByCategory[main]) ? listingSubcategoriesByCategory[main] : [];
        const activeSub = String(currentFilters.subcategory || '').trim();
        listEl.innerHTML = subs.map((s) => {
            const isActive = activeSub === s ? 'active' : '';
            return `<button type="button" class="home-category-swipe-item ${isActive}" data-main="${escapeHtml(main)}" data-sub="${escapeHtml(s)}"><i data-lucide="${escapeHtml(mainIcon)}"></i><span class="home-category-swipe-label">${escapeHtml(s)}</span></button>`;
        }).join('');
        scheduleLucideCreateIcons(listEl);
    }
}

function syncHomeCategorySwipeFromFilters() {
    const main = String(currentFilters.category || '').trim();
    if (!main) {
        homeCategorySwipeMode = 'main';
        homeCategorySwipeMainCategory = '';
        renderHomeCategorySwipe();
        return;
    }

    if (homeCategorySwipeMode === 'sub' && homeCategorySwipeMainCategory && homeCategorySwipeMainCategory !== main) {
        homeCategorySwipeMode = 'main';
        homeCategorySwipeMainCategory = '';
        renderHomeCategorySwipe();
        return;
    }

    if (homeCategorySwipeMode === 'sub' && !homeCategorySwipeMainCategory) {
        homeCategorySwipeMainCategory = main;
    }
    renderHomeCategorySwipe();
}

function ensureCategoryListings() {
    const adjectives = ["Neuf", "Bon plan", "Premium", "Top qualité", "À saisir"];
    const genericImages = [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500",
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=500",
        "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500"
    ];

    const imageByCategory = {
        "Boutiques": "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=500",
        "Immobilier": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500",
        "Automobiles & Véhicules": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500",
        "Pièces détachées": "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=500",
        "Téléphones & Accessoires": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
        "Informatique": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500",
        "Électroménager & Électronique": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
        "Vêtements & Mode": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500",
        "Santé & Beauté": "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
        "Meubles & Maison": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
        "Loisirs & Divertissements": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500",
        "Sport": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
        "Emploi": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500",
        "Matériaux & Équipement": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500",
        "Alimentaires": "https://images.unsplash.com/photo-1542838132-92c53300491e?w=500",
        "Voyages": "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=500",
        "Services": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=500"
    };

    const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const allCategoryNames = [
        ...categories.map(c => c.name),
        ...allExtraCategories.map(c => c.name)
    ];

    let nextId = Math.max(0, ...listings.map(l => l.id)) + 1;

    allCategoryNames.forEach(categoryName => {
        const existingCount = listings.filter(l => l.category === categoryName).length;
        const needed = Math.max(0, 2 - existingCount);

        for (let i = 0; i < needed; i++) {
            const adjective = pick(adjectives);
            const seller = pick(botProfiles);
            const location = pick(wilayas);
            const image = imageByCategory[categoryName] || pick(genericImages);
            const date = Math.random() > 0.6 ? "Aujourd'hui" : `Il y a ${rand(1, 6)} jours`;

            let price = rand(5000, 250000);
            if (categoryName === "Immobilier") price = rand(6000000, 50000000);
            if (categoryName === "Automobiles & Véhicules") price = rand(150000, 12000000);
            if (categoryName.includes("Emploi")) price = 0;
            if (categoryName.includes("Services")) price = rand(1500, 8000);
            if (categoryName === "Billetterie") price = rand(1000, 15000);

            listings.push({
                id: nextId++,
                title: `${adjective} - ${categoryName}`,
                price,
                category: categoryName,
                image,
                location,
                date,
                seller
            });
        }
    });
}

if (DEMO_MODE) ensureCategoryListings();

const MAX_LISTING_IMAGES = 10;
let selectedListingImages = Array.from({ length: MAX_LISTING_IMAGES }, () => null);
let selectedListingImageUrls = Array.from({ length: MAX_LISTING_IMAGES }, () => '');
let selectedListingImageSources = Array.from({ length: MAX_LISTING_IMAGES }, () => '');
let currentListingImageSlotIndex = 0;
let selectedListingVideoFile = null;
let selectedListingVideoObjectUrl = '';
let listingVideoUploadXhr = null;
let listingVideoUploadActive = false;
let listingVideoUploadCancelHandler = null;
let listingVideoTmpMeta = null;

const VERIFIED_BADGE_HTML = `<span class="verified-badge" title="Vendeur Vérifié" onclick="showVerifiedPopup(event)"><img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg" alt="Vérifié" style="filter: invert(48%) sepia(79%) saturate(2476%) hue-rotate(1deg) brightness(102%) contrast(105%);"></span>`;
const VIP_BADGE_HTML = `<span class="vip-badge" title="VIP" onclick="showVipPopup(event)"><span class="vip-star">★</span></span>`;

function getUserBadgesHTML(user) {
    let badges = [];
    if (user.verified) badges.push(VERIFIED_BADGE_HTML);
    if (user.isVip || user.vip) badges.push(VIP_BADGE_HTML);
    return badges.join('');
}

const body = document.body;
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const contentArea = document.querySelector('main');
const listingsGrid = document.getElementById('listingsGrid');
const pagination = document.getElementById('pagination');
const myListingsGrid = document.getElementById('myListingsGrid');
const toastContainer = document.getElementById('toastContainer');

loadThemeModeFromStorage();

function runWhenIdle(fn, timeout = 1500) {
    try {
        const w = window;
        if (typeof w.requestIdleCallback === 'function') {
            w.requestIdleCallback(() => fn(), { timeout });
            return;
        }
    } catch (e) {
        null;
    }
    setTimeout(() => fn(), 1);
}

document.addEventListener('DOMContentLoaded', async () => {
    loadLiveSocialShoppingTray();
    setPendingReferralFromUrl();
    cacheTranslationNodes();
    initLanguage();
    try {
        if (!window.__winjayBootTimer) {
            window.__winjayBootTimer = setTimeout(() => {
                try {
                    document.documentElement.classList.remove('app-booting');
                } catch (e) {
                    null;
                }
            }, 1200);
        }
    } catch (e) {
        null;
    }

    try {
        document.documentElement.classList.toggle('sidebar-collapsed', sidebar?.classList?.contains('collapsed'));
    } catch (e) {
        null;
    }
    try {
        document.documentElement.classList.remove('app-loading');
    } catch (e) {
        null;
    }
    updateNavbarAuthUI();
    initSupabase();
    await bootstrapSupabaseAuth();
    runWhenIdle(() => {
        Promise.all([
            refreshCoursesFeatureFlag({ silent: true }),
            refreshLiveSocialShoppingFeatureFlag({ silent: true })
        ])
            .then(() => {
                applyCoursesFeatureVisibility();
                applyLiveSocialShoppingFeatureVisibility();
            })
            .catch(() => null);
    }, 1200);
    runWhenIdle(() => {
        bootstrapLivePresence();
    }, 1200);
    if (!supabaseClient) {
        loadUserProfileFromStorage();
    }
    runWhenIdle(() => {
        setupListingVideoUploader();
        setupCreateCourseMediaUploader();
        setupCreateCourseLessonUploader();
        updateListingVideoGroupVisibility();
    }, 1200);
    populateWilayas();
    populateCategories();
    setupHomeCategorySwipe();
    setupListingSubcategorySelects();
    setupListingCitySelects();
    setupListingCoreFieldBindings();
    populateFilterDropdowns();
    populateAllExtraCategories();
    populateWorkCategoriesSelect();
    const editTypeEl = document.getElementById('editBusinessType');
    if (editTypeEl && !editTypeEl.dataset.boundWorkVis) {
        editTypeEl.dataset.boundWorkVis = '1';
        editTypeEl.addEventListener('change', () => {
            updateEditProfileWorkCategoryVisibility();
        });
    }
    updateEditProfileWorkCategoryVisibility();
    setupCategoryPickers();
    setupSelectPickers();
    runWhenIdle(() => {
        loadUserProfileImages();
        setupImageEditorDrag();
        handleIdentityFilePreview('idFrontInput', 'idFrontPreview');
        handleIdentityFilePreview('idBackInput', 'idBackPreview');
    }, 1200);
    runWhenIdle(() => {
        updateFreeVerifiedCounterUI();
        updateMobileFooterBarState();
        setupMobileFooterDocking();
        setupPasswordNoSpaceInputs();
    }, 1200);
    loadThemeModeFromStorage();
    const settingsToggle = document.getElementById('defaultDarkMode');
    if (settingsToggle && !settingsToggle.dataset.bound) {
        settingsToggle.dataset.bound = '1';
        settingsToggle.addEventListener('change', () => {
            setThemeMode(!!settingsToggle.checked);
        });
    }
    applyWinjayLogoTheme();

    if (!window.__winjayGlobalVisibilityHooked) {
        window.__winjayGlobalVisibilityHooked = true;
        document.addEventListener(
            'visibilitychange',
            () => {
                if (document.visibilityState !== 'hidden') return;
                if (marketplaceRenderTimer) {
                    try {
                        clearTimeout(marketplaceRenderTimer);
                    } catch (e) {
                        null;
                    }
                    marketplaceRenderTimer = null;
                }
                if (lucideRenderTimer) {
                    try {
                        clearTimeout(lucideRenderTimer);
                    } catch (e) {
                        null;
                    }
                    lucideRenderTimer = null;
                }
            },
            { passive: true }
        );
    }

    // Restore last viewed section
    const lastSectionRaw = localStorage.getItem('winjayLastSection') || 'home-section';
    const blocked = ['profile-section', 'messages-section', 'favorites-section', 'settings-section', 'admin-dashboard-section'];
    const lastSection = (blocked.includes(lastSectionRaw) && !isLoggedIn()) ? 'home-section' : lastSectionRaw;
    const params = new URLSearchParams(window.location.search);
    const adminParam = params.get(ADMIN_DASHBOARD_PARAM);
    if (adminParam && String(adminParam).trim() === ADMIN_DASHBOARD_VALUE) {
        try {
            sessionStorage.setItem(ADMIN_PENDING_OPEN_KEY, '1');
        } catch (e) {
            null;
        }
    }
    const profileParam = params.get('profile');
    const listingParam = params.get('listing');
    const editParam = params.get('edit');
    const newListingParam = params.get('new');
    const courseParam = params.get('course');
    const sectionParam = String(params.get('section') || '').trim();
    const modalParam = String(params.get('modal') || '').trim();
    const listingIdFromUrl = Number(listingParam) || 0;
    const editIdFromUrl = Number(editParam) || 0;
    const courseIdFromUrl = String(courseParam || '').trim();

    if (listingsGrid && (!Array.isArray(listings) || listings.length === 0)) {
        homeInitialListingsLoading = true;
        homeInitialListingsLoaded = false;
        listingsGrid.innerHTML = getHomeListingsSkeletonHTML(12);
        const empty = document.getElementById('emptyState');
        if (empty) empty.style.display = 'none';
        const gridEl = document.getElementById('listingsGrid');
        if (gridEl) gridEl.style.display = 'grid';
        if (pagination) pagination.innerHTML = '';
        updateLoadMoreListingsUI();
        renderVipVideoSection();
    }

    if (courseIdFromUrl) {
        if (isCoursesFeatureEnabledForViewer()) {
            activeCourseId = courseIdFromUrl;
            activeCourseFromSection = 'profile-section';
            showSection('course-section');
        } else {
            try {
                setCourseRouteParam('', { replace: true });
            } catch (e) {
                null;
            }
        }
    }
    if (!listingsLoadMoreBound) {
        listingsLoadMoreBound = true;
        const btn = document.getElementById('loadMoreListingsBtn');
        if (btn && !btn.dataset.bound) {
            btn.dataset.bound = '1';
            btn.addEventListener('click', async () => {
                if (DEMO_MODE) return;
                if (!listingsHasMore) return;
                const wrap = document.getElementById('loadMoreListingsWrap');
                listingsLoadMoreInFlight = true;
                try {
                    btn.disabled = true;
                    btn.textContent = 'Loading...';
                    if (wrap) wrap.style.display = 'flex';
                } catch (e) {
                    null;
                }
                try {
                    await fetchListingsFromSupabase({
                        silent: false,
                        includeProfiles: true,
                        limit: LISTINGS_FETCH_PAGE_SIZE,
                        append: true,
                        filters: currentFilters,
                        cursor: listingsNextCursor
                    });
                } finally {
                    listingsLoadMoreInFlight = false;
                    try {
                        btn.disabled = false;
                        btn.textContent = 'Load more';
                    } catch (e) {
                        null;
                    }
                    updateLoadMoreListingsUI();
                }
            });
        }
    }
    setupInfiniteListingsLoad();
    homeInitialListingsLoading = true;
    homeInitialListingsLoaded = false;
    const listingsPromise = fetchListingsFromSupabase({ silent: false, includeProfiles: true, limit: INITIAL_LISTINGS_FETCH_LIMIT, append: false });

    if (profileParam) {
        const tag = profileParam.startsWith('@') ? profileParam : '@' + profileParam;
        showSection('seller-profile-section');
        const content = document.getElementById('externalProfileContent');
        setInnerHTMLIfEmpty(content, getSellerProfileSkeletonHTML());
        endBootUI();
        await openSellerProfile(tag.toLowerCase(), 'listings', { pushState: false });
    } else if (newListingParam) {
        openCreateListingPage({ pushState: false });
        endBootUI();
    } else if (Number.isFinite(editIdFromUrl) && editIdFromUrl > 0) {
        await listingsPromise;
        openEditListingPageById(editIdFromUrl, { pushState: false });
        endBootUI();
    } else if (Number.isFinite(listingIdFromUrl) && listingIdFromUrl > 0) {
        await listingsPromise;
        openListingDetail(listingIdFromUrl, { pushState: false });
        endBootUI();
    } else {
        if (lastSection === 'seller-profile-section') {
            const storedTag = (localStorage.getItem(SELLER_PROFILE_LAST_TAG_STORAGE_KEY) || '').trim();
            if (storedTag) {
                showSection('seller-profile-section');
                const content = document.getElementById('externalProfileContent');
                setInnerHTMLIfEmpty(content, getSellerProfileSkeletonHTML());
                endBootUI();
                await openSellerProfile(storedTag.toLowerCase());
            } else {
                showSection('home-section');
                endBootUI();
            }
        } else if (sectionParam && crawlableStaticSections.has(sectionParam)) {
            showSection(sectionParam);
            endBootUI();
        } else {
            showSection(lastSection);
            endBootUI();
        }
    }

    if (modalParam === 'contact') {
        openModal('contactModal');
        scheduleLucideCreateIcons(document.getElementById('contactModal'));
    }

    if (DEMO_MODE) renderListings();
    runWhenIdle(() => {
        updateProfileUI();
        renderFavorites();
        setupChatFeatures();
        setupMessagesTwitterUI();
        bindChatJumpLatestScroll();
    }, 1200);
    bootstrapMessages();
    maybeOpenPendingAdmin();
    if (!window.__winjayRouteHooked) {
        window.__winjayRouteHooked = true;
        window.addEventListener('popstate', () => {
            try {
                handleListingRoutesFromUrl();
            } catch (e) {
                null;
            }
        });
    }
    try {
        document.documentElement.classList.remove('app-loading');
    } catch (e) {
        null;
    }
});

function setupPasswordNoSpaceInputs() {
    const ids = [
        'registerPassword',
        'registerPasswordConfirm',
        'changePasswordCurrent',
        'changePasswordNew',
        'changePasswordConfirm'
    ];
    ids.forEach((id) => {
        const input = document.getElementById(id);
        if (!input) return;
        enforceNoSpacesInTextInput(input);
    });
}

function enforceNoSpacesInTextInput(input) {
    input.addEventListener('keydown', (e) => {
        if (e.key === ' ') {
            e.preventDefault();
        }
    });

    input.addEventListener('input', () => {
        if (!/\s/.test(input.value)) return;
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        const before = input.value.slice(0, start);
        const after = input.value.slice(end);
        const nextValue = input.value.replace(/\s+/g, '');
        const removedBefore = (before.match(/\s/g) || []).length;
        input.value = nextValue;
        const nextPos = Math.max(0, start - removedBefore);
        input.setSelectionRange(nextPos, nextPos);
    });

    input.addEventListener('paste', (e) => {
        const data = e.clipboardData?.getData('text');
        if (typeof data !== 'string') return;
        if (!/\s/.test(data)) return;
        e.preventDefault();
        const clean = data.replace(/\s+/g, '');
        const start = input.selectionStart ?? input.value.length;
        const end = input.selectionEnd ?? input.value.length;
        input.value = input.value.slice(0, start) + clean + input.value.slice(end);
        const nextPos = start + clean.length;
        input.setSelectionRange(nextPos, nextPos);
    });
}

function setupMobileFooterDocking() {
    const footer = document.querySelector('footer');
    const bar = document.querySelector('.mobile-footer-bar');
    if (!footer || !bar) return;

    const update = () => {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        if (!isMobile) {
            document.body.classList.remove('mobile-footer-under');
            return;
        }
        const barHeight = bar.offsetHeight || 0;
        const footerTop = footer.getBoundingClientRect().top;
        const shouldDockUnder = footerTop < (window.innerHeight - barHeight);
        document.body.classList.toggle('mobile-footer-under', shouldDockUnder);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
}

function populateWilayas() {
    const selects = [
        document.getElementById('listingWilaya'),
        document.getElementById('editListingWilaya')
    ].filter(Boolean);
    selects.forEach((select) => {
        select.innerHTML = '<option value="" disabled selected>Sélectionnez une wilaya</option>';
        wilayas.forEach((wilaya) => {
            const option = document.createElement('option');
            option.value = wilaya;
            option.textContent = wilaya;
            select.appendChild(option);
        });
        refreshSelectPicker(select);
    });
}

const wilayaCitiesOverrides = {
    "16 Alger": ["Alger Centre", "Bab Ezzouar", "Bir Mourad Raïs", "Kouba", "Hydra", "Draria", "Chéraga", "Dar El Beïda"],
    "31 Oran": ["Oran", "Es Sénia", "Bir El Djir", "Akid Lotfi", "Aïn El Turk", "Arzew"],
    "25 Constantine": ["Constantine", "El Khroub", "Aïn Smara", "Didouche Mourad", "Hamma Bouziane"]
};

let communesByWilayaCode = null;
let communesLoadPromise = null;

function getWilayaCode(wilayaLabel) {
    const m = String(wilayaLabel || '').trim().match(/^(\d{2})\b/);
    return m ? m[1] : '';
}

function sanitizeCommuneName(value) {
    let s = String(value || '').trim();
    if (!s) return '';
    s = s.replace(/\s+/g, ' ');
    s = s.replace(/^[^A-Za-zÀ-ÿ0-9]+/g, '');
    return s.trim();
}

function normalizeCommuneList(items) {
    const seen = new Set();
    const out = [];
    (items || []).forEach((raw) => {
        const name = sanitizeCommuneName(raw);
        if (!name) return;
        const key = name.toLowerCase();
        if (seen.has(key)) return;
        seen.add(key);
        out.push(name);
    });
    return out;
}

async function loadAlgeriaCommunesData() {
    if (communesLoadPromise) return communesLoadPromise;
    communesLoadPromise = (async () => {
        try {
            const res = await fetch('algeria_communes.json', { cache: 'force-cache' });
            if (!res.ok) throw new Error('Failed to load communes dataset');
            const data = await res.json();
            const entries = Array.isArray(data?.wilayas) ? data.wilayas : [];
            const map = {};
            entries.forEach((w) => {
                const code = String(w?.code || '').trim();
                if (!/^\d{2}$/.test(code)) return;
                const list = normalizeCommuneList(Array.isArray(w?.communes) ? w.communes : []);
                if (!list.length) return;
                map[code] = list;
            });
            communesByWilayaCode = Object.keys(map).length ? map : null;
        } catch (e) {
            communesByWilayaCode = null;
        }
    })();
    return communesLoadPromise;
}

function getWilayaDisplayName(wilayaLabel) {
    return String(wilayaLabel || '').replace(/^\d+\s*/, '').trim();
}

function getCitiesForWilaya(wilayaLabel) {
    const key = String(wilayaLabel || '').trim();
    const code = getWilayaCode(key);
    const override = wilayaCitiesOverrides[key];
    const dataset = communesByWilayaCode && code ? communesByWilayaCode[code] : null;
    if (Array.isArray(dataset) && dataset.length) {
        if (Array.isArray(override) && override.length) {
            return normalizeCommuneList([...dataset, ...override]);
        }
        return dataset;
    }
    if (Array.isArray(override) && override.length) return override;
    const name = getWilayaDisplayName(key);
    return name ? [name] : [];
}

function populateCitySelect(selectEl, wilayaLabel, selectedValue = '') {
    if (!selectEl) return;
    const cities = getCitiesForWilaya(wilayaLabel);
    selectEl.innerHTML = '<option value="" disabled selected>Sélectionnez une ville / commune</option>';
    cities.forEach((city) => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        selectEl.appendChild(opt);
    });
    selectEl.disabled = cities.length === 0;
    if (selectedValue && cities.includes(selectedValue)) selectEl.value = selectedValue;
    refreshSelectPicker(selectEl);
}

function populateCitySelectLazy(selectEl, wilayaLabel, selectedValue = '') {
    if (!selectEl) return;
    const label = String(wilayaLabel || '').trim();
    if (!label) {
        selectEl.innerHTML = '<option value="" disabled selected>Sélectionnez une ville / commune</option>';
        selectEl.disabled = true;
        refreshSelectPicker(selectEl);
        return;
    }
    if (communesByWilayaCode) {
        populateCitySelect(selectEl, label, selectedValue);
        return;
    }
    selectEl.innerHTML = '<option value="" disabled selected>Chargement...</option>';
    selectEl.disabled = true;
    refreshSelectPicker(selectEl);
    loadAlgeriaCommunesData()
        .then(() => {
            populateCitySelect(selectEl, label, selectedValue);
        })
        .catch(() => {
            populateCitySelect(selectEl, label, selectedValue);
        });
}

function setupListingCitySelects() {
    const addWilaya = document.getElementById('listingWilaya');
    const addCity = document.getElementById('listingCity');
    const editWilaya = document.getElementById('editListingWilaya');
    const editCity = document.getElementById('editListingCity');

    if (addWilaya && addCity) {
        const refresh = () => populateCitySelectLazy(addCity, addWilaya.value, '');
        addWilaya.addEventListener('change', refresh);
        refresh();
    }
    if (editWilaya && editCity) {
        const refresh = () => populateCitySelectLazy(editCity, editWilaya.value, editCity.value || '');
        editWilaya.addEventListener('change', refresh);
        refresh();
    }
}

function setupListingCoreFieldBindings() {
    const addPriceType = document.getElementById('listingPriceType');
    const addPrice = document.getElementById('listingPrice');
    if (addPriceType && addPrice) {
        const apply = () => {
            const isFree = addPriceType.value === 'Free';
            addPrice.disabled = isFree;
            if (isFree) addPrice.value = '0';
        };
        addPriceType.addEventListener('change', apply);
        apply();
    }
    const editPriceType = document.getElementById('editListingPriceType');
    const editPrice = document.getElementById('editListingPrice');
    if (editPriceType && editPrice) {
        const apply = () => {
            const isFree = editPriceType.value === 'Free';
            editPrice.disabled = isFree;
            if (isFree) editPrice.value = '0';
        };
        editPriceType.addEventListener('change', apply);
        apply();
    }
}

const MAX_LISTING_VIDEO_BYTES = 50 * 1024 * 1024;
const MAX_LISTING_VIDEO_SECONDS = 30;

function updateListingVideoGroupVisibility() {
    const group = document.getElementById('listingVideoGroup');
    if (!group) return;
    const isVip = !!userProfile?.isVip;
    group.style.display = isVip ? '' : 'none';
    if (!isVip) removeSelectedListingVideo();
}

function formatUploadBytes(bytes) {
    const n = Number(bytes) || 0;
    if (n <= 0) return '0 MB';
    const mb = n / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    const gb = mb / 1024;
    return `${gb.toFixed(2)} GB`;
}

let courseMediaThumbObjectUrl = '';
let courseMediaUploadActive = false;
let courseMediaUploadXhr = null;
let courseMediaUploadCancelHandler = null;

let courseLessonUploadActive = false;
let courseLessonUploadXhr = null;
let courseLessonUploadCancelHandler = null;

const MAX_COURSE_VIDEO_DIMENSION = 1920;
const MAX_COURSE_VSL_SECONDS = 5 * 60;
const MAX_COURSE_VSL_BYTES = 50 * 1024 * 1024;
const MAX_COURSE_LESSON_SECONDS = 59 * 60;
const MAX_COURSE_LESSON_BYTES = 50 * 1024 * 1024;

async function readVideoMetaFromFile(file, { timeoutMs = 12000 } = {}) {
    const f = file || null;
    if (!f) return { error: 'Missing file' };
    let objectUrl = '';
    let timer = null;
    let video = null;
    return await new Promise((resolve) => {
        const done = (payload) => {
            try {
                if (timer) clearTimeout(timer);
            } catch (e) {
                null;
            }
            timer = null;
            try {
                if (video) {
                    video.onloadedmetadata = null;
                    video.onerror = null;
                    video.removeAttribute('src');
                    video.load?.();
                }
            } catch (e) {
                null;
            }
            try {
                if (objectUrl) URL.revokeObjectURL(objectUrl);
            } catch (e) {
                null;
            }
            objectUrl = '';
            resolve(payload);
        };

        video = document.createElement('video');
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;

        video.onloadedmetadata = () => {
            const duration = Number(video.duration) || 0;
            const width = Number(video.videoWidth) || 0;
            const height = Number(video.videoHeight) || 0;
            if (!duration || !width || !height) {
                done({ error: 'Invalid video metadata' });
                return;
            }
            done({ duration, width, height });
        };
        video.onerror = () => done({ error: 'Failed to read video metadata' });

        try {
            objectUrl = URL.createObjectURL(f);
            video.src = objectUrl;
        } catch (e) {
            done({ error: 'Failed to read file' });
            return;
        }

        timer = setTimeout(() => done({ error: 'Video metadata timed out' }), Math.max(1000, Number(timeoutMs) || 12000));
    });
}

function setCourseMediaUploadOverlay({ visible = false, percent = 0, loaded = 0, total = 0, label = '' } = {}) {
    const overlay = document.getElementById('courseMediaUploadOverlay');
    const ring = document.getElementById('courseMediaUploadRing');
    const percentEl = document.getElementById('courseMediaUploadPercent');
    const bytesEl = document.getElementById('courseMediaUploadBytes');
    const labelEl = document.getElementById('courseMediaUploadLabel');
    if (overlay) overlay.style.display = visible ? '' : 'none';
    const safeP = Math.max(0, Math.min(100, Number(percent) || 0));
    if (ring) ring.style.setProperty('--p', String(safeP));
    if (percentEl) percentEl.textContent = `${Math.round(safeP)}%`;
    if (bytesEl) bytesEl.textContent = `${formatUploadBytes(loaded)} / ${formatUploadBytes(total)}`;
    if (labelEl) labelEl.textContent = String(label || 'Uploading…');
}

function setCourseLessonUploadOverlay({ visible = false, percent = 0, loaded = 0, total = 0, label = '' } = {}) {
    const overlay = document.getElementById('courseLessonUploadOverlay');
    const ring = document.getElementById('courseLessonUploadRing');
    const percentEl = document.getElementById('courseLessonUploadPercent');
    const bytesEl = document.getElementById('courseLessonUploadBytes');
    const labelEl = document.getElementById('courseLessonUploadLabel');
    if (overlay) overlay.style.display = visible ? '' : 'none';
    const safeP = Math.max(0, Math.min(100, Number(percent) || 0));
    if (ring) ring.style.setProperty('--p', String(safeP));
    if (percentEl) percentEl.textContent = `${Math.round(safeP)}%`;
    if (bytesEl) bytesEl.textContent = `${formatUploadBytes(loaded)} / ${formatUploadBytes(total)}`;
    if (labelEl) labelEl.textContent = String(label || 'Uploading…');
}

function clearCourseMediaUploadState() {
    courseMediaUploadActive = false;
    courseMediaUploadXhr = null;
    courseMediaUploadCancelHandler = null;
    setCourseMediaUploadOverlay({ visible: false, percent: 0, loaded: 0, total: 0, label: '' });
    const cancelBtn = document.getElementById('courseMediaUploadCancelBtn');
    if (cancelBtn) cancelBtn.disabled = false;
}

function clearCourseLessonUploadState() {
    courseLessonUploadActive = false;
    courseLessonUploadXhr = null;
    courseLessonUploadCancelHandler = null;
    setCourseLessonUploadOverlay({ visible: false, percent: 0, loaded: 0, total: 0, label: '' });
    const cancelBtn = document.getElementById('courseLessonUploadCancelBtn');
    if (cancelBtn) cancelBtn.disabled = false;
}

function clearCourseMediaThumbPreview() {
    if (courseMediaThumbObjectUrl) {
        try { URL.revokeObjectURL(courseMediaThumbObjectUrl); } catch (e) { null; }
    }
    courseMediaThumbObjectUrl = '';
    const wrap = document.getElementById('createCourseThumbPreviewWrap');
    if (wrap) wrap.style.display = 'none';
    const img = document.getElementById('createCourseThumbPreview');
    if (img) img.removeAttribute('src');
}

async function uploadCourseFileToSignedUrlWithProgress({ signedUrl, file, label = 'Uploading…' } = {}) {
    const f = file || null;
    const url = String(signedUrl || '').trim();
    if (!f || !url) return { error: 'Missing upload url' };
    if (courseMediaUploadActive) return { error: 'Upload already in progress' };

    courseMediaUploadActive = true;
    setCourseMediaUploadOverlay({ visible: true, percent: 0, loaded: 0, total: Number(f.size) || 0, label });

    const cancelBtn = document.getElementById('courseMediaUploadCancelBtn');
    if (cancelBtn) cancelBtn.disabled = false;

    let canceled = false;
    courseMediaUploadCancelHandler = () => {
        canceled = true;
        try { courseMediaUploadXhr?.abort?.(); } catch (e) { null; }
        clearCourseMediaUploadState();
    };
    if (cancelBtn && !cancelBtn.dataset.bound) {
        cancelBtn.dataset.bound = '1';
        cancelBtn.addEventListener('click', () => courseMediaUploadCancelHandler?.());
    }

    const result = await new Promise((resolve) => {
        let finished = false;
        const done = (payload) => {
            if (finished) return;
            finished = true;
            clearCourseMediaUploadState();
            resolve(payload);
        };

        const xhr = new XMLHttpRequest();
        courseMediaUploadXhr = xhr;

        xhr.upload.onprogress = (ev) => {
            const total = Number(ev?.total) || Number(f.size) || 0;
            const loaded = Number(ev?.loaded) || 0;
            const pct = total > 0 ? (loaded / total) * 100 : 0;
            setCourseMediaUploadOverlay({ visible: true, percent: pct, loaded, total, label });
        };
        xhr.onerror = () => done({ error: 'Upload failed (network)' });
        xhr.onabort = () => done({ error: 'Upload canceled' });
        xhr.onload = () => {
            const ok = xhr.status >= 200 && xhr.status < 300;
            if (!ok) {
                done({ error: String(xhr.responseText || `Upload failed (${xhr.status})`) });
                return;
            }
            setCourseMediaUploadOverlay({ visible: true, percent: 100, loaded: Number(f.size) || 0, total: Number(f.size) || 0, label });
            done({ ok: true });
        };

        try {
            xhr.open('PUT', url, true);
            xhr.setRequestHeader('content-type', String(f.type || 'application/octet-stream'));
            xhr.send(f);
        } catch (e) {
            done({ error: 'Upload failed' });
        }
    });

    if (canceled) return { error: 'Upload canceled' };
    return result;
}

async function uploadCourseLessonFileToSignedUrlWithProgress({ signedUrl, file, label = 'Uploading…' } = {}) {
    const f = file || null;
    const url = String(signedUrl || '').trim();
    if (!f || !url) return { error: 'Missing upload url' };
    if (courseLessonUploadActive) return { error: 'Upload already in progress' };

    courseLessonUploadActive = true;
    setCourseLessonUploadOverlay({ visible: true, percent: 0, loaded: 0, total: Number(f.size) || 0, label });

    const cancelBtn = document.getElementById('courseLessonUploadCancelBtn');
    if (cancelBtn) cancelBtn.disabled = false;

    let canceled = false;
    courseLessonUploadCancelHandler = () => {
        canceled = true;
        try { courseLessonUploadXhr?.abort?.(); } catch (e) { null; }
        clearCourseLessonUploadState();
    };
    if (cancelBtn && !cancelBtn.dataset.bound) {
        cancelBtn.dataset.bound = '1';
        cancelBtn.addEventListener('click', () => courseLessonUploadCancelHandler?.());
    }

    const result = await new Promise((resolve) => {
        let finished = false;
        const done = (payload) => {
            if (finished) return;
            finished = true;
            clearCourseLessonUploadState();
            resolve(payload);
        };

        const xhr = new XMLHttpRequest();
        courseLessonUploadXhr = xhr;

        xhr.upload.onprogress = (ev) => {
            const total = Number(ev?.total) || Number(f.size) || 0;
            const loaded = Number(ev?.loaded) || 0;
            const pct = total > 0 ? (loaded / total) * 100 : 0;
            setCourseLessonUploadOverlay({ visible: true, percent: pct, loaded, total, label });
        };
        xhr.onerror = () => done({ error: 'Upload failed (network)' });
        xhr.onabort = () => done({ error: 'Upload canceled' });
        xhr.onload = () => {
            const ok = xhr.status >= 200 && xhr.status < 300;
            if (!ok) {
                done({ error: String(xhr.responseText || `Upload failed (${xhr.status})`) });
                return;
            }
            setCourseLessonUploadOverlay({ visible: true, percent: 100, loaded: Number(f.size) || 0, total: Number(f.size) || 0, label });
            done({ ok: true });
        };

        try {
            xhr.open('PUT', url, true);
            xhr.setRequestHeader('content-type', String(f.type || 'application/octet-stream'));
            xhr.send(f);
        } catch (e) {
            done({ error: 'Upload failed' });
        }
    });

    if (canceled) return { error: 'Upload canceled' };
    return result;
}

function resetCreateCourseMediaUI() {
    const thumbInput = document.getElementById('createCourseThumbnailFile');
    const thumbName = document.getElementById('createCourseThumbFileName');
    const thumbRemove = document.getElementById('createCourseThumbRemoveBtn');
    const vslInput = document.getElementById('createCourseVslFile');
    const vslName = document.getElementById('createCourseVslFileName');
    const vslRemove = document.getElementById('createCourseVslRemoveBtn');

    if (thumbInput) {
        thumbInput.value = '';
        delete thumbInput.dataset.fileToken;
        delete thumbInput.dataset.uploadedPath;
        delete thumbInput.dataset.uploadedToken;
    }
    if (thumbName) thumbName.textContent = 'No file chosen';
    if (thumbRemove) thumbRemove.style.display = 'none';
    clearCourseMediaThumbPreview();

    if (vslInput) {
        vslInput.value = '';
        delete vslInput.dataset.fileToken;
        delete vslInput.dataset.uploadedPath;
        delete vslInput.dataset.uploadedToken;
    }
    if (vslName) vslName.textContent = 'No file chosen';
    if (vslRemove) vslRemove.style.display = 'none';

    clearCourseMediaUploadState();
}

function resetCreateCourseLessonMediaUI() {
    const input = document.getElementById('createCourseLessonVideoFile');
    const nameEl = document.getElementById('createCourseLessonFileName');
    const removeBtn = document.getElementById('createCourseLessonRemoveBtn');
    if (input) input.value = '';
    if (nameEl) nameEl.textContent = 'No file chosen';
    if (removeBtn) removeBtn.style.display = 'none';
    clearCourseLessonUploadState();
}

function setupCreateCourseMediaUploader() {
    const thumbChoose = document.getElementById('createCourseThumbChooseBtn');
    const thumbInput = document.getElementById('createCourseThumbnailFile');
    const thumbName = document.getElementById('createCourseThumbFileName');
    const thumbRemove = document.getElementById('createCourseThumbRemoveBtn');
    const thumbWrap = document.getElementById('createCourseThumbPreviewWrap');
    const thumbPreview = document.getElementById('createCourseThumbPreview');

    if (thumbChoose && thumbInput && !thumbChoose.dataset.bound) {
        thumbChoose.dataset.bound = '1';
        thumbChoose.addEventListener('click', () => thumbInput.click());
    }
    if (thumbInput && !thumbInput.dataset.bound) {
        thumbInput.dataset.bound = '1';
        thumbInput.addEventListener('change', () => {
            const file = thumbInput.files?.[0] || null;
            if (!file) {
                delete thumbInput.dataset.fileToken;
                delete thumbInput.dataset.uploadedPath;
                delete thumbInput.dataset.uploadedToken;
                if (thumbName) thumbName.textContent = 'No file chosen';
                if (thumbRemove) thumbRemove.style.display = 'none';
                clearCourseMediaThumbPreview();
                return;
            }
            const token = `${String(file.name || '')}|${String(file.size || '')}|${String(file.lastModified || '')}`;
            if (thumbInput.dataset.fileToken !== token) {
                thumbInput.dataset.fileToken = token;
                delete thumbInput.dataset.uploadedPath;
                delete thumbInput.dataset.uploadedToken;
            }
            if (thumbName) thumbName.textContent = String(file.name || 'thumbnail');
            if (thumbRemove) thumbRemove.style.display = '';
            clearCourseMediaThumbPreview();
            try {
                courseMediaThumbObjectUrl = URL.createObjectURL(file);
                if (thumbPreview) thumbPreview.src = courseMediaThumbObjectUrl;
                if (thumbWrap) thumbWrap.style.display = '';
            } catch (e) {
                clearCourseMediaThumbPreview();
            }
        });
    }
    if (thumbRemove && thumbInput && !thumbRemove.dataset.bound) {
        thumbRemove.dataset.bound = '1';
        thumbRemove.addEventListener('click', () => {
            thumbInput.value = '';
            delete thumbInput.dataset.fileToken;
            delete thumbInput.dataset.uploadedPath;
            delete thumbInput.dataset.uploadedToken;
            if (thumbName) thumbName.textContent = 'No file chosen';
            thumbRemove.style.display = 'none';
            clearCourseMediaThumbPreview();
        });
    }

    const vslChoose = document.getElementById('createCourseVslChooseBtn');
    const vslInput = document.getElementById('createCourseVslFile');
    const vslName = document.getElementById('createCourseVslFileName');
    const vslRemove = document.getElementById('createCourseVslRemoveBtn');

    if (vslChoose && vslInput && !vslChoose.dataset.bound) {
        vslChoose.dataset.bound = '1';
        vslChoose.addEventListener('click', () => vslInput.click());
    }
    if (vslInput && !vslInput.dataset.bound) {
        vslInput.dataset.bound = '1';
        vslInput.addEventListener('change', async () => {
            const file = vslInput.files?.[0] || null;
            if (!file) {
                delete vslInput.dataset.fileToken;
                delete vslInput.dataset.uploadedPath;
                delete vslInput.dataset.uploadedToken;
                if (vslName) vslName.textContent = 'No file chosen';
                if (vslRemove) vslRemove.style.display = 'none';
                return;
            }
            const clearVsl = () => {
                vslInput.value = '';
                delete vslInput.dataset.fileToken;
                delete vslInput.dataset.uploadedPath;
                delete vslInput.dataset.uploadedToken;
                if (vslName) vslName.textContent = 'No file chosen';
                if (vslRemove) vslRemove.style.display = 'none';
            };
            const bytes = Number(file.size) || 0;
            if (bytes > MAX_COURSE_VSL_BYTES) {
                showToast('VSL video is too large (max 50MB)', 'alert-circle');
                clearVsl();
                return;
            }
            const meta = await readVideoMetaFromFile(file);
            if (meta?.error) {
                showToast(String(meta.error || 'Failed to read video'), 'alert-circle');
                clearVsl();
                return;
            }
            if (Number(meta.duration) > MAX_COURSE_VSL_SECONDS) {
                showToast('VSL video is too long (max 5 minutes)', 'alert-circle');
                clearVsl();
                return;
            }
            const maxDim = Math.max(Number(meta.width) || 0, Number(meta.height) || 0);
            if (maxDim > MAX_COURSE_VIDEO_DIMENSION) {
                showToast('VSL video exceeds 1080p (max 1920px)', 'alert-circle');
                clearVsl();
                return;
            }
            const token = `${String(file.name || '')}|${String(file.size || '')}|${String(file.lastModified || '')}`;
            if (vslInput.dataset.fileToken !== token) {
                vslInput.dataset.fileToken = token;
                delete vslInput.dataset.uploadedPath;
                delete vslInput.dataset.uploadedToken;
            }
            if (vslName) vslName.textContent = String(file.name || 'video');
            if (vslRemove) vslRemove.style.display = '';
        });
    }
    if (vslRemove && vslInput && !vslRemove.dataset.bound) {
        vslRemove.dataset.bound = '1';
        vslRemove.addEventListener('click', () => {
            vslInput.value = '';
            delete vslInput.dataset.fileToken;
            delete vslInput.dataset.uploadedPath;
            delete vslInput.dataset.uploadedToken;
            if (vslName) vslName.textContent = 'No file chosen';
            vslRemove.style.display = 'none';
        });
    }
}

function setupCreateCourseLessonUploader() {
    const chooseBtn = document.getElementById('createCourseLessonChooseBtn');
    const input = document.getElementById('createCourseLessonVideoFile');
    const nameEl = document.getElementById('createCourseLessonFileName');
    const removeBtn = document.getElementById('createCourseLessonRemoveBtn');

    if (chooseBtn && input && !chooseBtn.dataset.bound) {
        chooseBtn.dataset.bound = '1';
        chooseBtn.addEventListener('click', () => input.click());
    }
    if (input && !input.dataset.boundLesson) {
        input.dataset.boundLesson = '1';
        input.addEventListener('change', async () => {
            const file = input.files?.[0] || null;
            if (!file) {
                if (nameEl) nameEl.textContent = 'No file chosen';
                if (removeBtn) removeBtn.style.display = 'none';
                return;
            }
            const clearLesson = () => {
                input.value = '';
                if (nameEl) nameEl.textContent = 'No file chosen';
                if (removeBtn) removeBtn.style.display = 'none';
            };
            const bytes = Number(file.size) || 0;
            if (bytes > MAX_COURSE_LESSON_BYTES) {
                showToast('Lesson video is too large (max 50MB)', 'alert-circle');
                clearLesson();
                return;
            }
            const meta = await readVideoMetaFromFile(file);
            if (meta?.error) {
                showToast(String(meta.error || 'Failed to read video'), 'alert-circle');
                clearLesson();
                return;
            }
            if (Number(meta.duration) > MAX_COURSE_LESSON_SECONDS) {
                showToast('Lesson video is too long (max 59 minutes)', 'alert-circle');
                clearLesson();
                return;
            }
            const maxDim = Math.max(Number(meta.width) || 0, Number(meta.height) || 0);
            if (maxDim > MAX_COURSE_VIDEO_DIMENSION) {
                showToast('Lesson video exceeds 1080p (max 1920px)', 'alert-circle');
                clearLesson();
                return;
            }
            if (nameEl) nameEl.textContent = String(file.name || 'video');
            if (removeBtn) removeBtn.style.display = '';
        });
    }
    if (removeBtn && input && !removeBtn.dataset.bound) {
        removeBtn.dataset.bound = '1';
        removeBtn.addEventListener('click', () => {
            input.value = '';
            if (nameEl) nameEl.textContent = 'No file chosen';
            removeBtn.style.display = 'none';
        });
    }
}

function setListingVideoUploadOverlay({ visible = false, percent = 0, loaded = 0, total = 0 } = {}) {
    const wrap = document.getElementById('listingVideoPreviewWrap');
    const overlay = document.getElementById('listingVideoUploadOverlay');
    const ring = document.getElementById('listingVideoUploadRing');
    const percentEl = document.getElementById('listingVideoUploadPercent');
    const bytesEl = document.getElementById('listingVideoUploadBytes');
    if (wrap && visible) wrap.style.display = '';
    if (overlay) overlay.style.display = visible ? '' : 'none';
    const safeP = Math.max(0, Math.min(100, Number(percent) || 0));
    if (ring) ring.style.setProperty('--p', String(safeP));
    if (percentEl) percentEl.textContent = `${Math.round(safeP)}%`;
    if (bytesEl) bytesEl.textContent = `${formatUploadBytes(loaded)} / ${formatUploadBytes(total)}`;
}

function setListingSubmitVideoUploadState(active) {
    const btn = document.querySelector('#addListingForm button[type="submit"]');
    if (!btn) return;
    if (!btn.dataset.defaultText) btn.dataset.defaultText = btn.textContent || '';
    if (active) {
        btn.textContent = 'Upload en cours…';
        return;
    }
    btn.textContent = btn.dataset.defaultText || btn.textContent || '';
}

function clearListingVideoUploadState() {
    listingVideoUploadActive = false;
    listingVideoUploadXhr = null;
    listingVideoUploadCancelHandler = null;
    setListingVideoUploadOverlay({ visible: false, percent: 0, loaded: 0, total: 0 });
    setListingSubmitVideoUploadState(false);
    const cancelBtn = document.getElementById('listingVideoUploadCancelBtn');
    if (cancelBtn) cancelBtn.disabled = false;
}

function removeSelectedListingVideo() {
    if (listingVideoUploadCancelHandler) {
        try { listingVideoUploadCancelHandler(); } catch (e) { null; }
    }
    selectedListingVideoFile = null;
    const tmpPath = listingVideoTmpMeta?.path || '';
    listingVideoTmpMeta = null;
    if (selectedListingVideoObjectUrl) {
        try { URL.revokeObjectURL(selectedListingVideoObjectUrl); } catch (e) { null; }
    }
    selectedListingVideoObjectUrl = '';
    const input = document.getElementById('listingVideoInput');
    if (input) input.value = '';
    const nameEl = document.getElementById('listingVideoFileName');
    if (nameEl) nameEl.textContent = 'Aucun fichier';
    const wrap = document.getElementById('listingVideoPreviewWrap');
    if (wrap) wrap.style.display = 'none';
    const preview = document.getElementById('listingVideoPreview');
    if (preview) {
        preview.removeAttribute('src');
        try { preview.load(); } catch (e) { null; }
    }
    clearListingVideoUploadState();
    const uploadBtn = document.getElementById('listingVideoUploadBtn');
    if (uploadBtn) {
        uploadBtn.style.display = 'none';
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Réessayer';
    }
    const btn = document.getElementById('listingVideoRemoveBtn');
    if (btn) btn.style.display = 'none';
    if (tmpPath) {
        try {
            const client = initSupabase();
            client?.storage?.from?.(LISTING_VIDEOS_BUCKET)?.remove?.([String(tmpPath)]);
        } catch (e) {
            null;
        }
    }
}

async function validateAndPreviewListingVideo(file) {
    if (!file) return false;
    const type = String(file.type || '').toLowerCase();
    if (!type.startsWith('video/')) {
        showToast('Fichier vidéo invalide', 'alert-circle');
        return false;
    }
    if (file.size > MAX_LISTING_VIDEO_BYTES) {
        showToast('Vidéo trop grande (50MB max)', 'alert-circle');
        return false;
    }

    const objectUrl = URL.createObjectURL(file);
    const probe = document.createElement('video');
    probe.preload = 'metadata';
    probe.muted = true;
    probe.playsInline = true;

    const duration = await new Promise((resolve) => {
        let done = false;
        const finish = (val) => {
            if (done) return;
            done = true;
            resolve(val);
        };
        const timeout = setTimeout(() => finish(null), 5000);
        probe.onloadedmetadata = () => {
            clearTimeout(timeout);
            const d = Number(probe.duration);
            finish(Number.isFinite(d) ? d : null);
        };
        probe.onerror = () => {
            clearTimeout(timeout);
            finish(null);
        };
        probe.src = objectUrl;
    });

    try { probe.removeAttribute('src'); } catch (e) { null; }
    try { probe.load(); } catch (e) { null; }

    if (!Number.isFinite(duration) || duration <= 0) {
        try { URL.revokeObjectURL(objectUrl); } catch (e) { null; }
        showToast('Impossible de lire la durée de la vidéo', 'alert-circle');
        return false;
    }
    if (duration > MAX_LISTING_VIDEO_SECONDS) {
        try { URL.revokeObjectURL(objectUrl); } catch (e) { null; }
        showToast('Vidéo trop longue (30s max)', 'alert-circle');
        return false;
    }

    selectedListingVideoFile = file;
    if (selectedListingVideoObjectUrl) {
        try { URL.revokeObjectURL(selectedListingVideoObjectUrl); } catch (e) { null; }
    }
    selectedListingVideoObjectUrl = objectUrl;
    const wrap = document.getElementById('listingVideoPreviewWrap');
    if (wrap) wrap.style.display = '';
    const preview = document.getElementById('listingVideoPreview');
    if (preview) {
        preview.src = objectUrl;
        try { preview.load(); } catch (e) { null; }
    }
    clearListingVideoUploadState();
    const nameEl = document.getElementById('listingVideoFileName');
    if (nameEl) nameEl.textContent = String(file.name || 'video');
    const uploadBtn = document.getElementById('listingVideoUploadBtn');
    if (uploadBtn) {
        uploadBtn.style.display = 'none';
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Réessayer';
    }
    const btn = document.getElementById('listingVideoRemoveBtn');
    if (btn) btn.style.display = '';
    setTimeout(() => startAutoListingVideoUpload({ source: 'select' }), 0);
    return true;
}

async function requestVipListingVideoTmpSignedUpload({ filename, contentType } = {}) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase non configuré' };
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData?.session?.access_token || '';
    if (!token) return { error: 'Session expirée. Reconnectez-vous.' };
    try {
        const res = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/vip-listing-video-tmp-upload`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                apikey: SUPABASE_ANON_KEY,
                authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                filename: safeStorageFilename(filename || 'video.mp4'),
                contentType: String(contentType || 'video/mp4')
            })
        });
        const raw = await res.text();
        let payload = null;
        try { payload = raw ? JSON.parse(raw) : null; } catch (e) { payload = null; }
        if (!res.ok) {
            if (res.status === 404) return { error: "Fonction vidéo introuvable. Déployez 'vip-listing-video-tmp-upload' sur Supabase." };
            return { error: payload?.error || raw || `Requête d'upload vidéo échouée (${res.status})` };
        }
        if (!payload?.signedUrl || !payload?.path) return { error: "Réponse d'upload invalide" };
        return payload;
    } catch (e) {
        return { error: "Requête d'upload vidéo échouée" };
    }
}

async function requestVipListingVideoAttach({ listingId, tmpPath } = {}) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase non configuré' };
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData?.session?.access_token || '';
    if (!token) return { error: 'Session expirée. Reconnectez-vous.' };
    const safeListingId = Number(listingId) || 0;
    if (!safeListingId) return { error: 'Annonce invalide' };
    const safeTmp = String(tmpPath || '').trim();
    if (!safeTmp) return { error: 'Vidéo manquante' };
    try {
        const res = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/vip-listing-video-attach`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                apikey: SUPABASE_ANON_KEY,
                authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ listingId: safeListingId, tmpPath: safeTmp })
        });
        const raw = await res.text();
        let payload = null;
        try { payload = raw ? JSON.parse(raw) : null; } catch (e) { payload = null; }
        if (!res.ok) {
            if (res.status === 404) return { error: "Fonction vidéo introuvable. Déployez 'vip-listing-video-attach' sur Supabase." };
            return { error: payload?.error || raw || `Attachement vidéo échoué (${res.status})` };
        }
        if (!payload?.video_path) return { error: "Réponse d'attachement invalide" };
        return payload;
    } catch (e) {
        return { error: "Attachement vidéo échoué" };
    }
}

const LISTING_THUMB_MAX_PX = 520;
const LISTING_THUMB_QUALITY = 0.78;

async function createListingThumbnailBlob(file, { maxPx = LISTING_THUMB_MAX_PX, quality = LISTING_THUMB_QUALITY } = {}) {
    const f = file;
    if (!f || !String(f.type || '').startsWith('image/')) return null;
    let bitmap = null;
    let img = null;
    let objectUrl = '';
    try {
        try {
            bitmap = await createImageBitmap(f);
        } catch (e) {
            bitmap = null;
        }
        let w = bitmap?.width || 0;
        let h = bitmap?.height || 0;
        if (!w || !h) {
            objectUrl = URL.createObjectURL(f);
            img = await new Promise((resolve) => {
                const el = new Image();
                el.onload = () => resolve(el);
                el.onerror = () => resolve(null);
                el.src = objectUrl;
            });
            w = img?.naturalWidth || img?.width || 0;
            h = img?.naturalHeight || img?.height || 0;
        }
        if (!w || !h) return null;
        const scale = Math.min(1, Number(maxPx) > 0 ? (Number(maxPx) / Math.max(w, h)) : 1);
        const outW = Math.max(1, Math.round(w * scale));
        const outH = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement('canvas');
        canvas.width = outW;
        canvas.height = outH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        if (bitmap) ctx.drawImage(bitmap, 0, 0, outW, outH);
        else if (img) ctx.drawImage(img, 0, 0, outW, outH);
        else return null;
        const blob = await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b || null), 'image/webp', quality);
        });
        if (blob) return blob;
        return await new Promise((resolve) => {
            canvas.toBlob((b) => resolve(b || null), 'image/jpeg', quality);
        });
    } catch (e) {
        return null;
    } finally {
        try {
            bitmap?.close?.();
        } catch (e) {
            null;
        }
        try {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        } catch (e) {
            null;
        }
    }
}

async function manualUploadSelectedListingVideo() {
    startAutoListingVideoUpload({ source: 'retry' });
}

function setListingVideoUploadButtonState({ mode = 'hidden' } = {}) {
    const btn = document.getElementById('listingVideoUploadBtn');
    if (!btn) return;
    if (mode === 'hidden') {
        btn.style.display = 'none';
        btn.disabled = false;
        btn.textContent = 'Réessayer';
        return;
    }
    if (mode === 'retry') {
        btn.style.display = '';
        btn.disabled = false;
        btn.textContent = 'Réessayer';
        return;
    }
    if (mode === 'done') {
        btn.style.display = '';
        btn.disabled = true;
        btn.textContent = 'Terminé';
        return;
    }
}

async function startAutoListingVideoUpload({ source = 'auto' } = {}) {
    if (listingVideoUploadActive) return;
    if (!userProfile?.isVip) return;
    if (!selectedListingVideoFile) return;
    setListingVideoUploadButtonState({ mode: 'hidden' });
    listingVideoTmpMeta = null;
    listingVideoUploadActive = true;
    setListingSubmitVideoUploadState(true);
    setListingVideoUploadOverlay({ visible: true, percent: 0, loaded: 0, total: Number(selectedListingVideoFile.size) || 0 });
    let canceled = false;
    listingVideoUploadCancelHandler = () => {
        canceled = true;
        clearListingVideoUploadState();
        setListingVideoUploadButtonState({ mode: 'retry' });
    };
    const signed = await requestVipListingVideoTmpSignedUpload({
        filename: selectedListingVideoFile?.name || 'video.mp4',
        contentType: selectedListingVideoFile?.type || 'video/mp4'
    });
    if (!signed?.signedUrl || !signed?.path) {
        clearListingVideoUploadState();
        showToast(signed?.error || 'Upload vidéo échoué', 'alert-circle');
        setListingVideoUploadButtonState({ mode: 'retry' });
        return;
    }
    if (canceled) return;
    const res = await uploadVipListingVideoToStorage({ listingId: 0, file: selectedListingVideoFile, signed });
    if (!res?.video_path) {
        showToast(res?.error || 'Upload vidéo échoué', 'alert-circle');
        setListingVideoUploadButtonState({ mode: 'retry' });
        return;
    }
    listingVideoTmpMeta = { path: String(res.video_path || ''), publicUrl: String(res.video_url || '') };
    showToast('Vidéo uploadée', 'check-circle');
    selectedListingVideoFile = null;
    setListingVideoUploadButtonState({ mode: 'done' });
}

function setupListingVideoUploader() {
    const input = document.getElementById('listingVideoInput');
    if (!input || input.dataset.bound) return;
    input.dataset.bound = '1';
    const chooseBtn = document.getElementById('listingVideoChooseBtn');
    if (chooseBtn && !chooseBtn.dataset.bound) {
        chooseBtn.dataset.bound = '1';
        chooseBtn.addEventListener('click', () => {
            try { input.click(); } catch (e) { null; }
        });
    }
    const uploadBtn = document.getElementById('listingVideoUploadBtn');
    if (uploadBtn && !uploadBtn.dataset.bound) {
        uploadBtn.dataset.bound = '1';
        uploadBtn.addEventListener('click', () => manualUploadSelectedListingVideo());
    }
    const cancelBtn = document.getElementById('listingVideoUploadCancelBtn');
    if (cancelBtn && !cancelBtn.dataset.bound) {
        cancelBtn.dataset.bound = '1';
        cancelBtn.addEventListener('click', () => {
            if (listingVideoUploadCancelHandler) {
                try { cancelBtn.disabled = true; listingVideoUploadCancelHandler(); } catch (e) { null; }
            }
        });
    }
    input.addEventListener('change', async (e) => {
        const f = e?.target?.files?.[0] || null;
        if (!f) return;
        if (!userProfile?.isVip) {
            showToast('VIP requis pour la vidéo', 'crown');
            input.value = '';
            const nameEl = document.getElementById('listingVideoFileName');
            if (nameEl) nameEl.textContent = 'Aucun fichier';
            return;
        }
        const ok = await validateAndPreviewListingVideo(f);
        if (!ok) {
            input.value = '';
            const nameEl = document.getElementById('listingVideoFileName');
            if (nameEl) nameEl.textContent = 'Aucun fichier';
        }
    });
}

function populateFilterDropdowns() {
    const filterWilaya = document.getElementById('filterWilaya');
    const filterCategory = document.getElementById('filterCategory');
    wilayas.forEach(wilaya => {
        const option = document.createElement('option');
        option.value = wilaya;
        option.textContent = wilaya;
        filterWilaya.appendChild(option);
    });
    categories.filter(c => c.special !== 'other').forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        filterCategory.appendChild(option);
    });
}

function populateCategories() {
    const categorySelect = document.getElementById('listingCategory');
    const sidebarList = document.getElementById('categoryList');
    categorySelect.innerHTML = '<option value="" disabled selected>Sélectionnez une catégorie</option>';
    const shouldBuildSidebar = !!sidebarList && sidebarList.children.length === 0;
    if (shouldBuildSidebar) {
        sidebarList.innerHTML = '';
        const allLi = document.createElement('li');
        allLi.innerHTML = `<a href="#" onclick="filterByCategory('all', this); return false;"><i data-lucide="layout-grid"></i> Tous</a>`;
        sidebarList.appendChild(allLi);
    }

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.name;
        option.textContent = cat.name;
        if (cat.special === 'other') {
            option.textContent = "Autres...";
            option.value = "OPEN_OTHER_MODAL";
        }
        categorySelect.appendChild(option);
        if (shouldBuildSidebar) {
            const li = document.createElement('li');
            if (cat.special === 'other') {
                li.innerHTML = `<a href="#" onclick="openOtherCategoriesModal(true); return false;"><i data-lucide="${cat.icon}"></i> ${cat.name}</a>`;
            } else {
                const safeName = cat.name.replace(/'/g, "\\'");
                li.innerHTML = `<a href="#" onclick="filterByCategory('${safeName}', this); return false;"><i data-lucide="${cat.icon}"></i> ${cat.name}</a>`;
            }
            sidebarList.appendChild(li);
        }
    });
    categorySelect.addEventListener('change', function() {
        if (this.value === "OPEN_OTHER_MODAL") {
            openCategoryPicker('listingCategory');
            this.value = "";
            refreshSelectPicker(this);
        }
    });
    scheduleLucideCreateIcons(document.getElementById('sidebar') || document.body);
}

function populateListingSubcategorySelect(selectEl, mainCategory, selectedValue = '') {
    if (!selectEl) return;
    const main = normalizeListingCategory(String(mainCategory || '').trim(), selectedValue || '');
    const list = Array.isArray(listingSubcategoriesByCategory[main]) ? listingSubcategoriesByCategory[main] : [];
    selectEl.innerHTML = '<option value="" disabled selected>Sélectionnez une sous-catégorie</option>';
    list.forEach((name) => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        selectEl.appendChild(opt);
    });
    selectEl.disabled = list.length === 0;
    if (selectedValue && list.includes(selectedValue)) selectEl.value = selectedValue;
    refreshSelectPicker(selectEl);
}

const listingDynamicFieldSchemas = {
    "Boutiques::*": [
        { key: 'business_type', label: 'Type de boutique', type: 'select', required: true, options: ['Magasin', 'Restaurant/Café', 'Showroom', 'Superette', 'Autre'] },
        { key: 'address', label: 'Adresse', type: 'text', required: false, placeholder: 'Rue / quartier' },
        { key: 'opening_hours', label: 'Horaires', type: 'text', required: false, placeholder: 'ex: 09:00 - 18:00' },
        { key: 'delivery_available', label: 'Livraison', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Immobilier::*": [
        { key: 'property_type', label: 'Type de bien', type: 'select', required: true, options: ['Appartement', 'Maison/Villa', 'Studio', 'Terrain', 'Local commercial', 'Bureau', 'Autre'] },
        { key: 'surface_m2', label: 'Surface (m²)', type: 'number', required: true, min: 5, max: 10000000 },
        { key: 'rooms', label: 'Pièces', type: 'text', required: false, placeholder: 'ex: F3' },
        { key: 'furnished', label: 'Meublé', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'floor', label: 'Étage', type: 'number', required: false, min: -2, max: 200 },
        { key: 'elevator', label: 'Ascenseur', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Immobilier::Vente": [
        { key: 'property_type', label: 'Type de bien', type: 'select', required: true, options: ['Appartement', 'Maison/Villa', 'Studio', 'Terrain', 'Local commercial', 'Bureau', 'Autre'] },
        { key: 'surface_m2', label: 'Surface (m²)', type: 'number', required: true, min: 5, max: 10000000 },
        { key: 'rooms', label: 'Pièces', type: 'text', required: false, placeholder: 'ex: F3' },
        { key: 'acte', label: 'Acte', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'credit', label: 'Crédit', type: 'select', required: false, options: ['Accepté', 'Non'] }
    ],
    "Immobilier::Location": [
        { key: 'property_type', label: 'Type de bien', type: 'select', required: true, options: ['Appartement', 'Maison/Villa', 'Studio', 'Local commercial', 'Bureau', 'Autre'] },
        { key: 'surface_m2', label: 'Surface (m²)', type: 'number', required: true, min: 5, max: 10000000 },
        { key: 'rooms', label: 'Pièces', type: 'text', required: false, placeholder: 'ex: F3' },
        { key: 'charges_included', label: 'Charges incluses', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'deposit', label: 'Caution (DA)', type: 'number', required: false, min: 0, max: 100000000 },
        { key: 'available_from', label: 'Disponible à partir de', type: 'text', required: false, placeholder: 'ex: 2026-06-01' }
    ],
    "Immobilier::Terrains": [
        { key: 'surface_m2', label: 'Surface (m²)', type: 'number', required: true, min: 5, max: 100000000 },
        { key: 'zone', label: 'Zone', type: 'select', required: false, options: ['Urbaine', 'Rurale', 'Industrielle', 'Agricole'] },
        { key: 'viabilise', label: 'Viabilisé', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'facade_m', label: 'Façade (m)', type: 'number', required: false, min: 1, max: 100000 }
    ],
    "Immobilier::Location vacances": [
        { key: 'capacity', label: 'Capacité (personnes)', type: 'number', required: true, min: 1, max: 500 },
        { key: 'nights_price', label: 'Prix / nuit (DA)', type: 'number', required: false, min: 0, max: 100000000 },
        { key: 'pool', label: 'Piscine', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'sea_view', label: 'Vue mer', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Immobilier::Colocation": [
        { key: 'spots', label: 'Nombre de places', type: 'number', required: true, min: 1, max: 50 },
        { key: 'room_type', label: 'Type de chambre', type: 'select', required: false, options: ['Individuelle', 'Partagée'] },
        { key: 'charges_included', label: 'Charges incluses', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'profile_wanted', label: 'Profil recherché', type: 'text', required: false, placeholder: 'ex: Étudiants' }
    ],
    "Automobiles & Véhicules::*": [
        { key: 'make', label: 'Marque', type: 'text', required: true, placeholder: 'ex: Renault' },
        { key: 'model', label: 'Modèle', type: 'text', required: true, placeholder: 'ex: Clio' },
        { key: 'year', label: 'Année', type: 'number', required: true, min: 1950, max: 2035 },
        { key: 'mileage_km', label: 'Kilométrage (km)', type: 'number', required: false, min: 0, max: 4000000 },
        { key: 'fuel', label: 'Carburant', type: 'select', required: false, options: ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'] },
        { key: 'gearbox', label: 'Boîte', type: 'select', required: false, options: ['Manuelle', 'Automatique'] }
    ],
    "Automobiles & Véhicules::Voitures": [
        { key: 'make', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'year', label: 'Année', type: 'number', required: true, min: 1950, max: 2035 },
        { key: 'mileage_km', label: 'Kilométrage (km)', type: 'number', required: true, min: 0, max: 4000000 },
        { key: 'fuel', label: 'Carburant', type: 'select', required: true, options: ['Essence', 'Diesel', 'Hybride', 'Électrique', 'GPL'] },
        { key: 'gearbox', label: 'Boîte', type: 'select', required: false, options: ['Manuelle', 'Automatique'] },
        { key: 'doors', label: 'Portes', type: 'number', required: false, min: 2, max: 8 },
        { key: 'color', label: 'Couleur', type: 'text', required: false }
    ],
    "Automobiles & Véhicules::Motos & Scooters": [
        { key: 'make', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'year', label: 'Année', type: 'number', required: true, min: 1950, max: 2035 },
        { key: 'mileage_km', label: 'Kilométrage (km)', type: 'number', required: false, min: 0, max: 2000000 },
        { key: 'engine_cc', label: 'Cylindrée (cc)', type: 'number', required: false, min: 30, max: 3000 }
    ],
    "Automobiles & Véhicules::Camions & Utilitaires": [
        { key: 'make', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'year', label: 'Année', type: 'number', required: true, min: 1950, max: 2035 },
        { key: 'mileage_km', label: 'Kilométrage (km)', type: 'number', required: false, min: 0, max: 6000000 },
        { key: 'payload_kg', label: 'Charge utile (kg)', type: 'number', required: false, min: 0, max: 100000 },
        { key: 'fuel', label: 'Carburant', type: 'select', required: false, options: ['Diesel', 'Essence', 'Hybride', 'Électrique', 'GPL'] }
    ],
    "Automobiles & Véhicules::Location de voitures": [
        { key: 'price_per_day', label: 'Prix / jour (DA)', type: 'number', required: true, min: 0, max: 100000000 },
        { key: 'deposit', label: 'Caution (DA)', type: 'number', required: false, min: 0, max: 100000000 },
        { key: 'delivery_available', label: 'Livraison', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'conditions', label: 'Conditions', type: 'text', required: false, placeholder: 'ex: permis + âge' }
    ],
    "Automobiles & Véhicules::Bus & Minibus": [
        { key: 'make', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'year', label: 'Année', type: 'number', required: true, min: 1950, max: 2035 },
        { key: 'mileage_km', label: 'Kilométrage (km)', type: 'number', required: false, min: 0, max: 8000000 },
        { key: 'fuel', label: 'Carburant', type: 'select', required: false, options: ['Diesel', 'Essence', 'Hybride', 'Électrique', 'GPL'] },
        { key: 'seats', label: 'Places', type: 'number', required: false, min: 2, max: 120 }
    ],
    "Automobiles & Véhicules::Engins & Machines": [
        { key: 'machine_type', label: 'Type', type: 'select', required: true, options: ['Tracteur', 'Pelle', 'Chargeuse', 'Bulldozer', 'Grue', 'Chariot élévateur', 'Compresseur', 'Générateur', 'Autre'] },
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: false },
        { key: 'year', label: 'Année', type: 'number', required: false, min: 1950, max: 2035 },
        { key: 'hours', label: 'Heures', type: 'number', required: false, min: 0, max: 500000 },
        { key: 'fuel', label: 'Carburant', type: 'select', required: false, options: ['Diesel', 'Essence', 'Hybride', 'Électrique', 'GPL'] }
    ],
    "Pièces détachées::*": [
        { key: 'part_type', label: 'Type de pièce', type: 'text', required: true, placeholder: 'ex: alternateur' },
        { key: 'vehicle_type', label: 'Pour', type: 'select', required: false, options: ['Auto', 'Moto', 'Camion', 'Autre'] },
        { key: 'compatibility', label: 'Compatibilité', type: 'text', required: false, placeholder: 'ex: Clio 2015-2018' },
        { key: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Comme neuf', 'Bon état', 'Usé'] },
        { key: 'warranty', label: 'Garantie', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Téléphones & Accessoires::*": [
        { key: 'brand', label: 'Marque', type: 'text', required: true, placeholder: 'ex: Samsung' },
        { key: 'model', label: 'Modèle', type: 'text', required: true, placeholder: 'ex: S22' }
    ],
    "Téléphones & Accessoires::Smartphones": [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'storage_gb', label: 'Stockage (GB)', type: 'number', required: true, min: 4, max: 2000 },
        { key: 'ram_gb', label: 'RAM (GB)', type: 'number', required: false, min: 1, max: 128 },
        { key: 'battery_health', label: 'Batterie', type: 'select', required: false, options: ['Bonne', 'Moyenne', 'À changer'] },
        { key: 'dual_sim', label: 'Double SIM', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'network', label: 'Réseau', type: 'select', required: false, options: ['3G', '4G', '5G'] },
        { key: 'color', label: 'Couleur', type: 'text', required: false }
    ],
    "Téléphones & Accessoires::Téléphones simples": [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'dual_sim', label: 'Double SIM', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'network', label: 'Réseau', type: 'select', required: false, options: ['2G', '3G', '4G'] },
        { key: 'color', label: 'Couleur', type: 'text', required: false }
    ],
    "Téléphones & Accessoires::Tablettes": [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'screen_inches', label: 'Écran (pouces)', type: 'number', required: false, min: 6, max: 30 },
        { key: 'storage_gb', label: 'Stockage (GB)', type: 'number', required: true, min: 4, max: 2000 },
        { key: 'connectivity', label: 'Connectivité', type: 'select', required: false, options: ['Wi‑Fi', '4G', '5G'] },
        { key: 'color', label: 'Couleur', type: 'text', required: false }
    ],
    "Téléphones & Accessoires::Accessoires (chargeur/écouteurs)": [
        { key: 'accessory_type', label: 'Type d’accessoire', type: 'select', required: true, options: ['Chargeur', 'Câble', 'Écouteurs', 'Casque', 'Power bank', 'Coque', 'Verre trempé', 'Support voiture', 'Autre'] },
        { key: 'brand', label: 'Marque', type: 'text', required: false, placeholder: 'ex: Anker' },
        { key: 'compatibility', label: 'Compatibilité', type: 'text', required: true, when: { key: 'accessory_type', in: ['Coque', 'Verre trempé'] }, placeholder: 'ex: iPhone 14 / Galaxy S23' },
        { key: 'connector', label: 'Connecteur', type: 'select', required: true, when: { key: 'accessory_type', in: ['Chargeur', 'Câble', 'Écouteurs', 'Casque', 'Power bank'] }, options: ['USB‑C', 'Lightning', 'Micro‑USB', 'Jack 3.5', 'Sans fil', 'Autre'] },
        { key: 'wattage_w', label: 'Puissance (W)', type: 'number', required: false, when: { key: 'accessory_type', in: ['Chargeur'] }, min: 1, max: 300 },
        { key: 'capacity_mah', label: 'Capacité (mAh)', type: 'number', required: false, when: { key: 'accessory_type', in: ['Power bank'] }, min: 500, max: 200000 },
        { key: 'wireless', label: 'Sans fil', type: 'select', required: false, when: { key: 'accessory_type', in: ['Écouteurs', 'Casque'] }, options: ['Oui', 'Non'] }
    ],
    "Téléphones & Accessoires::Réparation": [
        { key: 'repair_type', label: 'Type de réparation', type: 'select', required: true, options: ['Écran', 'Batterie', 'Port de charge', 'Caméra', 'Logiciel', 'Autre'] },
        { key: 'compatibility', label: 'Modèle concerné', type: 'text', required: true, placeholder: 'ex: iPhone 12 / Galaxy A52' },
        { key: 'warranty', label: 'Garantie', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'availability', label: 'Disponibilité', type: 'text', required: false, placeholder: 'ex: 7j/7' }
    ],
    "Informatique::*": [
        { key: 'computer_type', label: 'Type', type: 'select', required: true, options: ['Laptop', 'Desktop', 'Gaming PC', 'MacBook / iMac', 'Parts'] },
        { key: 'brand', label: 'Marque', type: 'text', required: false, placeholder: 'ex: Dell / HP / Apple' },
        { key: 'model', label: 'Modèle', type: 'text', required: false, placeholder: 'ex: Latitude 5420' },
        { key: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Comme neuf', 'Bon état', 'Usé', 'Pour pièces'] },
        { key: 'warranty', label: 'Garantie', type: 'select', required: false, options: ['Oui', 'Non'] },

        { key: 'cpu', label: 'CPU', type: 'text', required: true, when: { key: 'computer_type', in: ['Laptop', 'Desktop', 'Gaming PC', 'MacBook / iMac'] }, placeholder: 'ex: i5-1135G7 / Ryzen 5 5600X' },
        { key: 'ram_gb', label: 'RAM (GB)', type: 'number', required: true, when: { key: 'computer_type', in: ['Laptop', 'Desktop', 'Gaming PC', 'MacBook / iMac'] }, min: 1, max: 512 },
        { key: 'storage', label: 'Stockage', type: 'text', required: true, when: { key: 'computer_type', in: ['Laptop', 'Desktop', 'Gaming PC', 'MacBook / iMac'] }, placeholder: 'ex: 512GB SSD + 1TB HDD' },
        { key: 'gpu', label: 'GPU', type: 'text', required: false, when: { key: 'computer_type', in: ['Laptop', 'Desktop', 'Gaming PC', 'MacBook / iMac'] }, placeholder: 'ex: RTX 4060 / Iris Xe' },
        { key: 'os', label: 'Système', type: 'select', required: false, when: { key: 'computer_type', in: ['Laptop', 'Desktop', 'Gaming PC', 'MacBook / iMac'] }, options: ['Windows 11', 'Windows 10', 'Linux', 'macOS', 'Sans OS'] },

        { key: 'screen_inches', label: 'Écran (pouces)', type: 'number', required: false, when: { key: 'computer_type', in: ['Laptop', 'MacBook / iMac'] }, min: 9, max: 40 },
        { key: 'screen_resolution', label: 'Résolution', type: 'text', required: false, when: { key: 'computer_type', in: ['Laptop', 'MacBook / iMac'] }, placeholder: 'ex: 1920x1080' },
        { key: 'battery_health', label: 'Batterie', type: 'select', required: false, when: { key: 'computer_type', in: ['Laptop', 'MacBook / iMac'] }, options: ['Bonne', 'Moyenne', 'À changer'] },
        { key: 'keyboard_layout', label: 'Clavier', type: 'select', required: false, when: { key: 'computer_type', in: ['Laptop', 'MacBook / iMac'] }, options: ['AZERTY', 'QWERTY', 'AR', 'Autre'] },

        { key: 'form_factor', label: 'Format', type: 'select', required: false, when: { key: 'computer_type', in: ['Desktop', 'Gaming PC'] }, options: ['Tower', 'SFF', 'Mini PC', 'All-in-one', 'Autre'] },
        { key: 'psu_watts', label: 'Alimentation (W)', type: 'number', required: false, when: { key: 'computer_type', in: ['Desktop', 'Gaming PC'] }, min: 100, max: 2000 },
        { key: 'cooling', label: 'Refroidissement', type: 'select', required: false, when: { key: 'computer_type', in: ['Desktop', 'Gaming PC'] }, options: ['Air', 'Water', 'Stock', 'Autre'] },

        { key: 'apple_chip', label: 'Chip (Apple)', type: 'select', required: false, when: { key: 'computer_type', in: ['MacBook / iMac'] }, options: ['Intel', 'M1', 'M2', 'M3', 'M4'] },

        { key: 'part_type', label: 'Type de pièce', type: 'select', required: true, when: { key: 'computer_type', in: ['Parts'] }, options: ['GPU', 'CPU', 'RAM', 'SSD', 'HDD', 'Carte mère', 'Alimentation (PSU)', 'Boîtier', 'Écran', 'Réseau', 'Autre'] },
        { key: 'compatibility', label: 'Compatibilité', type: 'text', required: false, when: { key: 'computer_type', in: ['Parts'] }, placeholder: 'ex: DDR4 / LGA1700 / AM4' }
    ],
    "Informatique::PC Portables": [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'cpu', label: 'CPU', type: 'text', required: true },
        { key: 'ram_gb', label: 'RAM (GB)', type: 'number', required: true, min: 1, max: 512 },
        { key: 'storage', label: 'Stockage', type: 'text', required: true, placeholder: 'ex: 512GB SSD' },
        { key: 'screen_inches', label: 'Écran (pouces)', type: 'number', required: false, min: 9, max: 30 },
        { key: 'gpu', label: 'GPU', type: 'text', required: false }
    ],
    "Informatique::PC Bureau": [
        { key: 'cpu', label: 'CPU', type: 'text', required: true },
        { key: 'ram_gb', label: 'RAM (GB)', type: 'number', required: true, min: 1, max: 512 },
        { key: 'storage', label: 'Stockage', type: 'text', required: true },
        { key: 'gpu', label: 'GPU', type: 'text', required: false }
    ],
    "Informatique::Écrans": [
        { key: 'screen_type', label: 'Type d’écran', type: 'select', required: true, options: ['Monitor', 'TV', 'Projector'] },
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: false },
        { key: 'size_inches', label: 'Taille (pouces)', type: 'number', required: true, min: 10, max: 300 },
        { key: 'resolution', label: 'Résolution', type: 'select', required: false, options: ['HD', 'Full HD', '2K', '4K', '8K'] },
        { key: 'panel', label: 'Dalle', type: 'select', required: false, options: ['IPS', 'VA', 'TN', 'OLED', 'Autre'] },
        { key: 'refresh_hz', label: 'Fréquence (Hz)', type: 'number', required: false, min: 30, max: 1000 },
        { key: 'ports', label: 'Ports', type: 'text', required: false, placeholder: 'ex: HDMI, DP, USB-C' },
        { key: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Comme neuf', 'Bon état', 'Usé'] },
        { key: 'warranty', label: 'Garantie', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Informatique::Stockage (SSD/HDD)": [
        { key: 'storage_type', label: 'Type', type: 'select', required: true, options: ['SSD', 'HDD', 'NVMe', 'External'] },
        { key: 'capacity_gb', label: 'Capacité (GB)', type: 'number', required: true, min: 4, max: 100000 },
        { key: 'form_factor', label: 'Format', type: 'select', required: false, optionsBy: { key: 'storage_type', map: {
            'HDD': [{ value: '2.5', label: '2.5"' }, { value: '3.5', label: '3.5"' }, { value: 'external', label: 'External' }],
            'SSD': [{ value: '2.5', label: '2.5"' }, { value: 'm2', label: 'M.2' }, { value: 'external', label: 'External' }],
            'NVMe': [{ value: 'm2', label: 'M.2' }],
            'External': [{ value: 'usb', label: 'USB' }, { value: 'usbc', label: 'USB‑C' }]
        }, default: [{ value: '2.5', label: '2.5"' }, { value: '3.5', label: '3.5"' }, { value: 'm2', label: 'M.2' }, { value: 'usb', label: 'USB' }, { value: 'usbc', label: 'USB‑C' }, { value: 'other', label: 'Autre' }] } },
        { key: 'interface', label: 'Interface', type: 'select', required: false, options: ['SATA', 'NVMe', 'USB 3.0', 'USB-C', 'Autre'] },
        { key: 'health', label: 'État santé', type: 'select', required: false, options: ['Neuf', 'Bon', 'Moyen', 'À remplacer'] },
        { key: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Comme neuf', 'Bon état', 'Usé'] },
        { key: 'warranty', label: 'Garantie', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Informatique::Logiciels": [
        { key: 'software_type', label: 'Type', type: 'select', required: true, options: ['OS', 'Office', 'Antivirus', 'Design', 'Other'] },
        { key: 'name', label: 'Nom', type: 'text', required: true, placeholder: 'ex: Microsoft Office' },
        { key: 'version', label: 'Version', type: 'text', required: false, placeholder: 'ex: 2024' },
        { key: 'platform', label: 'Plateforme', type: 'select', required: true, options: ['Windows', 'macOS', 'Android', 'iOS', 'Other'] },
        { key: 'license_type', label: 'Licence', type: 'select', required: true, options: ['Lifetime', 'Subscription', 'Trial', 'Key only'] },
        { key: 'delivery', label: 'Livraison', type: 'select', required: false, options: ['Email', 'Account transfer', 'Physical'] },
        { key: 'seats', label: 'Appareils / utilisateurs', type: 'number', required: false, min: 1, max: 1000 }
    ],
    "Électroménager & Électronique::*": [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: false },
        { key: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Comme neuf', 'Bon état', 'Usé'] },
        { key: 'warranty', label: 'Garantie', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Électroménager & Électronique::TV & Audio": [
        { key: 'brand', label: 'Marque', type: 'text', required: true },
        { key: 'model', label: 'Modèle', type: 'text', required: false },
        { key: 'screen_inches', label: 'Taille écran (pouces)', type: 'number', required: false, min: 10, max: 200 },
        { key: 'resolution', label: 'Résolution', type: 'select', required: false, options: ['HD', 'Full HD', '4K', '8K'] },
        { key: 'smart_tv', label: 'Smart TV', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Électroménager & Électronique::Consoles & Jeux": [
        { key: 'platform', label: 'Plateforme', type: 'select', required: true, options: ['PlayStation', 'Xbox', 'Nintendo', 'PC'] },
        { key: 'model', label: 'Modèle', type: 'text', required: true },
        { key: 'storage_gb', label: 'Stockage (GB)', type: 'number', required: false, min: 4, max: 5000 },
        { key: 'includes_games', label: 'Jeux inclus', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Vêtements & Mode::*": [
        { key: 'gender', label: 'Genre', type: 'select', required: false, options: ['Homme', 'Femme', 'Enfant', 'Unisexe'] },
        { key: 'brand', label: 'Marque', type: 'text', required: false },
        { key: 'size', label: 'Taille', type: 'text', required: false, placeholder: 'ex: M / 42' },
        { key: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Comme neuf', 'Bon état', 'Usé'] }
    ],
    "Santé & Beauté::*": [
        { key: 'type', label: 'Type', type: 'text', required: true, placeholder: 'ex: parfum' },
        { key: 'brand', label: 'Marque', type: 'text', required: false },
        { key: 'new_sealed', label: 'Neuf / scellé', type: 'select', required: false, options: ['Oui', 'Non'] },
        { key: 'expiry', label: 'Expiration', type: 'text', required: false, placeholder: 'ex: 2027-12' }
    ],
    "Meubles & Maison::*": [
        { key: 'type', label: 'Type', type: 'text', required: true, placeholder: 'ex: canapé' },
        { key: 'dimensions', label: 'Dimensions', type: 'text', required: false, placeholder: 'ex: 200x80' },
        { key: 'material', label: 'Matière', type: 'text', required: false },
        { key: 'delivery_available', label: 'Livraison', type: 'select', required: false, options: ['Oui', 'Non'] }
    ],
    "Loisirs & Divertissements::*": [
        { key: 'type', label: 'Type', type: 'text', required: true, placeholder: 'ex: jeu, instrument...' },
        { key: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Comme neuf', 'Bon état', 'Usé'] }
    ],
    "Loisirs & Divertissements::Livres": [
        { key: 'book_type', label: 'Type', type: 'select', required: false, options: ['Livre', 'Manga', 'BD/Comic', 'Manuel scolaire'] },
        { key: 'author', label: 'Auteur', type: 'text', required: true, placeholder: 'Nom de l’auteur' },
        { key: 'language', label: 'Langue', type: 'select', required: true, options: ['Français', 'Arabe', 'Anglais', 'Autre'] },
        { key: 'genre', label: 'Genre', type: 'select', required: false, options: ['Roman', 'Histoire', 'Religion', 'Développement personnel', 'Enfant', 'Science', 'Autre'] },
        { key: 'format', label: 'Format', type: 'select', required: false, options: ['Poche', 'Broché', 'Relié'] },
        { key: 'pages', label: 'Pages', type: 'number', required: false, min: 1, max: 20000 },
        { key: 'publisher', label: 'Éditeur', type: 'text', required: false },
        { key: 'publication_year', label: 'Année de publication', type: 'number', required: false, min: 1500, max: 2035 },
        { key: 'isbn', label: 'ISBN', type: 'text', required: false }
    ],
    "Sport::*": [
        { key: 'sport_type', label: 'Sport', type: 'text', required: true, placeholder: 'ex: football' },
        { key: 'brand', label: 'Marque', type: 'text', required: false },
        { key: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Comme neuf', 'Bon état', 'Usé'] }
    ],
    "Emploi::*": [
        { key: 'position', label: 'Poste', type: 'text', required: true, placeholder: 'ex: Serveur' },
        { key: 'contract', label: 'Contrat', type: 'select', required: false, options: ['CDI', 'CDD', 'Stage', 'Intérim', 'Freelance'] },
        { key: 'salary', label: 'Salaire', type: 'text', required: false, placeholder: 'ex: 50 000 DA' },
        { key: 'experience', label: 'Expérience', type: 'text', required: false, placeholder: 'ex: 2 ans' }
    ],
    "Matériaux & Équipement::*": [
        { key: 'type', label: 'Type', type: 'text', required: true, placeholder: 'ex: machine, outil...' },
        { key: 'brand', label: 'Marque', type: 'text', required: false },
        { key: 'model', label: 'Modèle', type: 'text', required: false },
        { key: 'condition', label: 'État', type: 'select', required: false, options: ['Neuf', 'Comme neuf', 'Bon état', 'Usé'] }
    ],
    "Alimentaires::*": [
        { key: 'product', label: 'Produit', type: 'text', required: true, placeholder: 'ex: miel' },
        { key: 'origin', label: 'Origine', type: 'text', required: false, placeholder: 'ex: Blida' },
        { key: 'unit', label: 'Unité', type: 'select', required: false, options: ['Kg', 'L', 'Pièce', 'Lot'] },
        { key: 'expiry', label: 'Expiration', type: 'text', required: false, placeholder: 'ex: 2027-12' }
    ],
    "Voyages::*": [
        { key: 'destination', label: 'Destination', type: 'text', required: true, placeholder: 'ex: Istanbul' },
        { key: 'duration', label: 'Durée', type: 'text', required: false, placeholder: 'ex: 7 jours' },
        { key: 'date', label: 'Date', type: 'text', required: false, placeholder: 'ex: 2026-07' },
        { key: 'includes', label: 'Inclus', type: 'text', required: false, placeholder: 'ex: hôtel + vol' }
    ],
    "Services::*": [
        { key: 'service', label: 'Service', type: 'text', required: true, placeholder: 'ex: plomberie' },
        { key: 'price', label: 'Prix', type: 'text', required: false, placeholder: 'ex: 2000 DA' },
        { key: 'availability', label: 'Disponibilité', type: 'text', required: false, placeholder: 'ex: 7j/7' },
        { key: 'experience', label: 'Expérience', type: 'text', required: false, placeholder: 'ex: 5 ans' }
    ]
};

function getListingDynamicSchema(category, subcategory) {
    const cat = normalizeListingCategory(String(category || '').trim(), String(subcategory || '').trim());
    const sub = String(subcategory || '').trim();
    const key = `${cat}::${sub}`;
    if (cat === 'Informatique') {
        const specialSubcategories = new Set(['Écrans', 'Stockage (SSD/HDD)', 'Logiciels']);
        if (specialSubcategories.has(sub) && Array.isArray(listingDynamicFieldSchemas[key])) return listingDynamicFieldSchemas[key];
        const fallback = `${cat}::*`;
        return Array.isArray(listingDynamicFieldSchemas[fallback]) ? listingDynamicFieldSchemas[fallback] : [];
    }
    if (Array.isArray(listingDynamicFieldSchemas[key])) return listingDynamicFieldSchemas[key];
    const fallback = `${cat}::*`;
    return Array.isArray(listingDynamicFieldSchemas[fallback]) ? listingDynamicFieldSchemas[fallback] : [];
}

function isDynamicFieldVisible(f, values) {
    const cond = f?.when;
    if (!cond) return true;
    const key = String(cond?.key || '').trim();
    if (!key) return true;
    const actual = values?.[key];
    if (Array.isArray(cond?.in)) return cond.in.map((x) => String(x)).includes(String(actual || ''));
    if (cond?.equals !== undefined) return String(actual || '') === String(cond.equals);
    if (cond?.notEquals !== undefined) return String(actual || '') !== String(cond.notEquals);
    return true;
}

function inferComputerType(category, subcategory) {
    const cat = normalizeListingCategory(String(category || '').trim(), String(subcategory || '').trim());
    if (cat !== 'Informatique') return '';
    const sub = normalizeText(String(subcategory || '').trim());
    if (sub.includes('portable') || sub.includes('laptop') || sub.includes('pc portable')) return 'Laptop';
    if (sub.includes('bureau') || sub.includes('desktop')) return 'Desktop';
    if (sub.includes('gamer') || sub.includes('gaming')) return 'Gaming PC';
    if (sub.includes('mac') || sub.includes('imac') || sub.includes('macbook')) return 'MacBook / iMac';
    if (sub.includes('composant') || sub.includes('piece') || sub.includes('pièce') || sub.includes('gpu') || sub.includes('cpu') || sub.includes('ram') || sub.includes('stockage') || sub.includes('ssd') || sub.includes('hdd')) return 'Parts';
    return '';
}

function normalizeDynamicSelectOptions(rawOptions) {
    const opts = Array.isArray(rawOptions) ? rawOptions : [];
    return opts
        .map((o) => {
            if (!o) return null;
            if (typeof o === 'string') return { value: o, label: o };
            if (typeof o === 'object') {
                const v = String(o.value ?? '').trim();
                const l = String(o.label ?? v).trim();
                if (!v) return null;
                return { value: v, label: l || v };
            }
            return null;
        })
        .filter(Boolean);
}

function getDynamicSelectOptionsForField(f, values) {
    const by = f?.optionsBy;
    if (by && typeof by === 'object') {
        const k = String(by.key || '').trim();
        const map = by.map && typeof by.map === 'object' ? by.map : null;
        const selected = k ? String(values?.[k] || '') : '';
        const raw = map && Object.prototype.hasOwnProperty.call(map, selected) ? map[selected] : (Array.isArray(by.default) ? by.default : []);
        return normalizeDynamicSelectOptions(raw);
    }
    return normalizeDynamicSelectOptions(f?.options);
}

function formatDynamicSelectValueForDisplay(f, rawValue, values) {
    const v = String(rawValue ?? '');
    if (!v) return '';
    if (String(f?.type || '') !== 'select') return v;
    const opts = getDynamicSelectOptionsForField(f, values || {});
    const match = opts.find((o) => String(o.value) === v);
    return match ? String(match.label || match.value) : v;
}

function collectListingDynamicFieldValues() {
    const container = document.getElementById('listingDynamicFields');
    if (!container) return {};
    const out = {};
    container.querySelectorAll('[data-dynamic-key]').forEach((el) => {
        const key = String(el.getAttribute('data-dynamic-key') || '').trim();
        if (!key) return;
        const raw = String(el.value || '').trim();
        if (!raw) return;
        const kind = String(el.getAttribute('data-dynamic-type') || '').trim();
        if (kind === 'number') {
            const n = Number(raw);
            if (Number.isFinite(n)) out[key] = n;
            return;
        }
        out[key] = raw;
    });
    return out;
}

function renderListingDynamicFields(seedValues = null) {
    const group = document.getElementById('listingDynamicFieldsGroup');
    const container = document.getElementById('listingDynamicFields');
    if (!group || !container) return;
    const category = document.getElementById('listingCategory')?.value || '';
    const subcategory = document.getElementById('listingSubcategory')?.value || '';
    const schema = getListingDynamicSchema(category, subcategory);
    const current = collectListingDynamicFieldValues();
    const values = { ...(current || {}), ...((seedValues && typeof seedValues === 'object') ? seedValues : {}) };
    if (normalizeListingCategory(String(category || '').trim(), String(subcategory || '').trim()) === 'Informatique' && !String(values?.computer_type || '').trim()) {
        const inferred = inferComputerType(category, subcategory);
        if (inferred) values.computer_type = inferred;
    }
    if (!schema.length) {
        group.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    group.style.display = '';
    if (!container.dataset.boundDynamicRerender) {
        container.dataset.boundDynamicRerender = '1';
        container.addEventListener('change', (e) => {
            const t = e?.target;
            if (!t?.getAttribute) return;
            const key = String(t.getAttribute('data-dynamic-key') || '').trim();
            if (key === 'computer_type' || key === 'storage_type') renderListingDynamicFields();
        });
    }
    container.innerHTML = schema
        .filter((f) => isDynamicFieldVisible(f, values))
        .map((f) => {
            const key = String(f.key || '').trim();
            if (!key) return '';
            const label = escapeHtml(String(f.label || key));
            const required = !!f.required;
            const value = values[key] ?? '';
            const placeholder = escapeHtml(String(f.placeholder || ''));
            if (String(f.type || '') === 'select') {
                const inputId = `listingDynamic__${key}`;
                const options = getDynamicSelectOptionsForField(f, values);
                const allowedValues = new Set(options.map((o) => String(o.value)));
                const selectedValue = allowedValues.has(String(value)) ? String(value) : '';
                const opts = ['<option value="" disabled' + (!selectedValue ? ' selected' : '') + '>Sélectionnez</option>']
                    .concat(
                        options.map((o) => {
                            const v = String(o.value || '');
                            const l = String(o.label || o.value || '');
                            const sel = selectedValue === v ? ' selected' : '';
                            return `<option value="${escapeHtml(v)}"${sel}>${escapeHtml(l)}</option>`;
                        })
                    )
                    .join('');
                return `
                    <div class="dynamic-field">
                        <label>${label}${required ? ' *' : ''}</label>
                        <select id="${escapeHtml(inputId)}" data-dynamic-key="${escapeHtml(key)}" data-dynamic-type="select">${opts}</select>
                    </div>
                `;
            }
            if (String(f.type || '') === 'number') {
                const min = Number.isFinite(Number(f.min)) ? ` min="${Number(f.min)}"` : '';
                const max = Number.isFinite(Number(f.max)) ? ` max="${Number(f.max)}"` : '';
                const val = value === 0 || value ? String(value) : '';
                const inputId = `listingDynamic__${key}`;
                return `
                    <div class="dynamic-field">
                        <label>${label}${required ? ' *' : ''}</label>
                        <input id="${escapeHtml(inputId)}" type="number"${min}${max} data-dynamic-key="${escapeHtml(key)}" data-dynamic-type="number" value="${escapeHtml(val)}" placeholder="${placeholder}">
                    </div>
                `;
            }
            const val = value === 0 || value ? String(value) : '';
            const inputId = `listingDynamic__${key}`;
            return `
                <div class="dynamic-field">
                    <label>${label}${required ? ' *' : ''}</label>
                    <input id="${escapeHtml(inputId)}" type="text" data-dynamic-key="${escapeHtml(key)}" data-dynamic-type="text" value="${escapeHtml(val)}" placeholder="${placeholder}">
                </div>
            `;
        })
        .join('');
    Array.from(container.querySelectorAll('select')).forEach((el) => enhanceSelectToPicker(el));
    Array.from(container.querySelectorAll('select')).forEach((el) => refreshSelectPicker(el));
}

function validateListingDynamicFields() {
    const category = document.getElementById('listingCategory')?.value || '';
    const subcategory = document.getElementById('listingSubcategory')?.value || '';
    const schema = getListingDynamicSchema(category, subcategory);
    const values = collectListingDynamicFieldValues();
    for (const f of schema) {
        if (!f?.required) continue;
        if (!isDynamicFieldVisible(f, values)) continue;
        const k = String(f.key || '').trim();
        const v = values[k];
        if (v === undefined || v === null || String(v).trim() === '') {
            showToast(`${String(f.label || k)} is required`, 'alert-circle');
            return null;
        }
    }
    return values;
}

function renderListingDynamicDetailRows(item) {
    const schema = getListingDynamicSchema(item?.category, item?.subcategory);
    const details = item?.details && typeof item.details === 'object' ? item.details : {};
    if (!schema.length) return '';
    const rows = schema
        .map((f) => {
            if (!isDynamicFieldVisible(f, details)) return '';
            const k = String(f.key || '').trim();
            if (!k) return '';
            const v = details[k];
            if (v === undefined || v === null || String(v).trim() === '') return '';
            const label = escapeHtml(String(f.label || k));
            let value = formatDynamicSelectValueForDisplay(f, v, details);
            if (k === 'mileage_km') {
                const n = Number(v);
                value = Number.isFinite(n) ? `${new Intl.NumberFormat('fr-DZ').format(n)} km` : String(v);
            }
            return `
                <div class="kv-row">
                    <div class="kv-label">${label}</div>
                    <div class="kv-value">${escapeHtml(value)}</div>
                </div>
            `;
        })
        .filter(Boolean)
        .join('');
    return rows;
}

const HOTEL_SERVICE_META = {
    wifi: { icon: 'wifi', label: { fr: 'WiFi', en: 'WiFi', ar: 'واي فاي' } },
    pool: { icon: 'waves', label: { fr: 'Piscine', en: 'Swimming pool', ar: 'مسبح' } },
    parking: { icon: 'parking-square', label: { fr: 'Parking', en: 'Parking', ar: 'موقف سيارات' } },
    restaurant: { icon: 'utensils', label: { fr: 'Restaurant', en: 'Restaurant', ar: 'مطعم' } },
    spa: { icon: 'flower', label: { fr: 'Spa', en: 'Spa', ar: 'سبا' } },
    gym: { icon: 'dumbbell', label: { fr: 'Gym', en: 'Gym', ar: 'نادي رياضي' } },
    ac: { icon: 'snowflake', label: { fr: 'Climatisation', en: 'Air conditioning', ar: 'مكيف' } },
    heating: { icon: 'flame', label: { fr: 'Chauffage', en: 'Heating', ar: 'تدفئة' } },
    room_service: { icon: 'concierge-bell', label: { fr: 'Room service', en: 'Room service', ar: 'خدمة الغرف' } },
    laundry: { icon: 'shirt', label: { fr: 'Blanchisserie', en: 'Laundry', ar: 'غسيل' } },
    airport_shuttle: { icon: 'bus', label: { fr: 'Navette aéroport', en: 'Airport shuttle', ar: 'حافلة المطار' } },
    security: { icon: 'shield', label: { fr: 'Sécurité 24/7', en: 'Security', ar: 'أمن' } },
    cctv: { icon: 'video', label: { fr: 'Vidéosurveillance', en: 'CCTV', ar: 'كاميرات مراقبة' } },
    elevator: { icon: 'arrow-up-down', label: { fr: 'Ascenseur', en: 'Elevator', ar: 'مصعد' } },
    accessible: { icon: 'accessibility', label: { fr: 'Accès handicapé', en: 'Accessible', ar: 'مهيأ لذوي الإعاقة' } },
    breakfast: { icon: 'coffee', label: { fr: 'Petit-déjeuner', en: 'Breakfast', ar: 'فطور' } },
    safe: { icon: 'lock', label: { fr: 'Coffre-fort', en: 'Safe', ar: 'خزنة' } },
    minibar: { icon: 'wine', label: { fr: 'Mini-bar', en: 'Minibar', ar: 'ميني بار' } },
    tv: { icon: 'tv', label: { fr: 'TV', en: 'TV', ar: 'تلفاز' } },
    balcony: { icon: 'sun', label: { fr: 'Balcon', en: 'Balcony', ar: 'شرفة' } }
};

function getHotelServiceDisplay(key) {
    const k = String(key || '').trim();
    if (!k) return null;
    const meta = HOTEL_SERVICE_META[k] || null;
    if (!meta) return { icon: 'check', label: k };
    const label = meta.label?.[currentLang] || meta.label?.fr || meta.label?.en || k;
    return { icon: meta.icon || 'check', label };
}

function renderHotelServicesFacilitiesHTML(services) {
    const list = Array.isArray(services) ? services.filter(Boolean) : [];
    if (!list.length) return '';
    const items = list
        .map((k) => getHotelServiceDisplay(k))
        .filter(Boolean)
        .map((entry) => {
            const icon = escapeHtml(String(entry.icon || 'check'));
            const label = escapeHtml(String(entry.label || ''));
            return `<span class="hotel-facility-item"><i data-lucide="${icon}"></i><span>${label}</span></span>`;
        })
        .join('');
    return `<div class="hotel-facilities">${items}</div>`;
}

function renderHotelDetailRows(item) {
    const category = normalizeListingCategory(String(item?.category || '').trim(), String(item?.subcategory || '').trim());
    if (category !== 'Hébergement') return '';
    const hotel = item?.details?.hotel && typeof item.details.hotel === 'object' ? item.details.hotel : null;
    if (!hotel) return '';

    const rooms = Array.isArray(hotel.rooms) ? hotel.rooms : [];
    const prices = rooms.map((r) => Number(r?.price_per_night) || 0).filter((n) => n > 0);
    const from = prices.length ? Math.min(...prices) : null;
    const services = Array.isArray(hotel.services) ? hotel.services.filter(Boolean) : [];
    const payments = Array.isArray(hotel.payments) ? hotel.payments.filter(Boolean) : [];

    const parts = [
        hotel.stars ? { label: 'Étoiles', value: `${hotel.stars}★` } : null,
        hotel.check_in ? { label: 'Check-in', value: String(hotel.check_in) } : null,
        hotel.check_out ? { label: 'Check-out', value: String(hotel.check_out) } : null,
        rooms.length ? { label: 'Chambres', value: String(rooms.length) } : null,
        from ? { label: 'À partir de / nuit', value: `${new Intl.NumberFormat('fr-DZ').format(from)} DZD` } : null,
        payments.length ? { label: 'Paiement', value: payments.join(', ') } : null
    ].filter(Boolean);

    const rows = parts
        .map((p) => `
            <div class="kv-row">
                <div class="kv-label">${escapeHtml(p.label)}</div>
                <div class="kv-value">${escapeHtml(p.value)}</div>
            </div>
        `)
        .join('');

    const servicesRow = services.length
        ? `
            <div class="kv-row">
                <div class="kv-label">${escapeHtml('Services')}</div>
                <div class="kv-value">${renderHotelServicesFacilitiesHTML(services)}</div>
            </div>
        `
        : '';

    return rows + servicesRow;
}

function renderListingDetailsCardRows(item) {
    const category = normalizeListingCategory(String(item?.category || '').trim(), String(item?.subcategory || '').trim());
    const isHotel = category === 'Hébergement';
    const isJob = category === 'Emploi';
    const isRealEstate = category === 'Immobilier';
    const isShop = category === 'Boutiques';
    const isTravel = category === 'Voyages';
    const isService = category === 'Services';

    const hideCondition = isHotel || isJob || isRealEstate || isShop || isTravel || isService;
    const hideDelivery = isHotel || isJob || isRealEstate || isTravel || isService || isShop;
    const hideAvailability = isHotel || isJob || isRealEstate || isShop || isTravel || isService;

    let rows = '';
    if (!hideAvailability) {
        rows += `
            <div class="kv-row">
                <div class="kv-label">Disponibilité</div>
                <div class="kv-value">${escapeHtml(item.availability || '—')}</div>
            </div>
        `;
    }
    if (!hideCondition) {
        rows += `
            <div class="kv-row">
                <div class="kv-label">État</div>
                <div class="kv-value">${escapeHtml(item.condition || '—')}</div>
            </div>
        `;
    }
    if (!hideDelivery) {
        rows += `
            <div class="kv-row">
                <div class="kv-label">Livraison</div>
                <div class="kv-value">${escapeHtml(item.delivery || '—')}</div>
            </div>
        `;
    }

    rows += renderListingDynamicDetailRows(item);
    rows += renderHotelDetailRows(item);
    return rows;
}

function setupListingSubcategorySelects() {
    const mainAdd = document.getElementById('listingCategory');
    const subAdd = document.getElementById('listingSubcategory');
    const mainEdit = document.getElementById('editListingCategory');
    const subEdit = document.getElementById('editListingSubcategory');

    if (mainAdd && subAdd) {
        const refresh = () => {
            populateListingSubcategorySelect(subAdd, mainAdd.value, '');
            renderListingDynamicFields();
            toggleHotelFieldsVisibility();
        };
        mainAdd.addEventListener('change', refresh);
        subAdd.addEventListener('change', () => {
            renderListingDynamicFields();
            toggleHotelFieldsVisibility();
        });
        refresh();
    }
    if (mainEdit && subEdit) {
        const refresh = () => populateListingSubcategorySelect(subEdit, mainEdit.value, subEdit.value || '');
        mainEdit.addEventListener('change', refresh);
        refresh();
    }
}

function toggleHotelFieldsVisibility() {
    const catEl = document.getElementById('listingCategory');
    const subEl = document.getElementById('listingSubcategory');
    const hotelSection = document.getElementById('hotelFieldsSection');
    if (!catEl || !hotelSection) return;
    const cat = catEl.value || '';
    const sub = subEl?.value || '';
    const normalized = normalizeListingCategory(cat, sub);
    const isHotel = normalized === 'Hébergement';
    const isJob = normalized === 'Emploi';
    const isRealEstate = normalized === 'Immobilier';
    const isShop = normalized === 'Boutiques';
    const isTravel = normalized === 'Voyages';
    const isService = normalized === 'Services';
    hotelSection.style.display = isHotel ? 'block' : 'none';

    const groupFor = (id) => document.getElementById(id)?.closest?.('.form-group') || null;
    const hideGroup = (id, hidden) => {
        const g = groupFor(id);
        if (g) g.style.display = hidden ? 'none' : '';
    };
    const setValue = (id, value) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = value;
        try {
            if (el.tagName === 'SELECT') refreshSelectPicker(el);
        } catch (e) {
            null;
        }
    };

    const hideCondition = isHotel || isJob || isRealEstate || isShop || isTravel || isService;
    const hideDelivery = isHotel || isJob || isRealEstate || isTravel || isService || isShop;
    const hideAvailability = isHotel || isJob || isRealEstate || isShop || isTravel || isService;
    const hidePriceType = isHotel || isJob;
    const hidePrice = isJob;

    hideGroup('listingCondition', hideCondition);
    hideGroup('listingPriceType', hidePriceType);
    hideGroup('listingDelivery', hideDelivery);
    hideGroup('listingAvailability', hideAvailability);
    hideGroup('listingPrice', hidePrice);

    if (hideCondition) {
        setValue('listingCondition', 'New');
    }
    if (hideDelivery) {
        setValue('listingDelivery', 'Pickup only');
    }
    if (hideAvailability) {
        setValue('listingAvailability', 'Available');
    }

    if (isHotel) {
        setValue('listingPriceType', 'Fixed');
    }
    if (isJob) {
        setValue('listingPriceType', 'Free');
        const priceEl = document.getElementById('listingPrice');
        if (priceEl) priceEl.value = '0';
    }

    const priceGroup = groupFor('listingPrice');
    const priceLabel = priceGroup?.querySelector?.('label') || null;
    const priceInput = document.getElementById('listingPrice');
    if (priceLabel) {
        if (!priceLabel.dataset.defaultText) priceLabel.dataset.defaultText = priceLabel.textContent || '';
        priceLabel.textContent = isHotel ? 'Prix (DA) - à partir de' : (priceLabel.dataset.defaultText || '');
    }
    if (priceInput) {
        if (!priceInput.dataset.defaultPlaceholder) priceInput.dataset.defaultPlaceholder = priceInput.placeholder || '';
        priceInput.placeholder = isHotel ? 'Prix minimum par nuit' : (priceInput.dataset.defaultPlaceholder || '');
    }

    const tagsInput = document.getElementById('listingTags');
    if (tagsInput) {
        if (!tagsInput.dataset.defaultPlaceholder) tagsInput.dataset.defaultPlaceholder = tagsInput.placeholder || '';
        const defaultPh = tagsInput.dataset.defaultPlaceholder || '';
        const ph = isHotel
            ? 'ex: vue mer, famille, spa, centre-ville'
            : (isJob
                ? 'ex: serveur, alger, temps plein'
                : (isRealEstate
                    ? 'ex: f3, bab ezzouar, vue mer'
                    : defaultPh));
        tagsInput.placeholder = ph;
    }
}

function getHotelMinRoomPriceFromForm() {
    const container = document.getElementById('hotelRoomsList');
    if (!container) return null;
    const prices = Array.from(container.querySelectorAll('input[id^="hotelRoomPrice_"]'))
        .map((el) => Number(el?.value) || 0)
        .filter((n) => n > 0);
    if (!prices.length) return null;
    return Math.min(...prices);
}

let hotelRoomCount = 0;

function addHotelRoomField(roomData = {}) {
    const container = document.getElementById('hotelRoomsList');
    if (!container) return;
    const id = hotelRoomCount++;
    const card = document.createElement('div');
    card.className = 'hotel-room-card';
    card.id = `hotelRoomCard_${id}`;
    card.innerHTML = `
        <div class="hotel-room-card-header">
            <span class="hotel-room-card-title">Chambre ${id + 1}</span>
            <button type="button" class="hotel-room-card-remove" onclick="removeHotelRoomField('hotelRoomCard_${id}')">
                <i data-lucide="trash-2"></i>
            </button>
        </div>
        <div class="hotel-room-grid">
            <div class="form-group">
                <label>Nom de la chambre</label>
                <input type="text" id="hotelRoomName_${id}" placeholder="ex: Chambre Double Standard" value="${roomData.room_name || ''}">
            </div>
            <div class="form-group">
                <label>Prix/nuit (DA)</label>
                <input type="number" id="hotelRoomPrice_${id}" placeholder="0" value="${roomData.price_per_night || ''}">
            </div>
            <div class="form-group">
                <label>Adultes max</label>
                <input type="number" id="hotelRoomAdults_${id}" min="1" max="10" value="${roomData.max_adults || 2}">
            </div>
            <div class="form-group">
                <label>Enfants max</label>
                <input type="number" id="hotelRoomChildren_${id}" min="0" max="10" value="${roomData.max_children || 0}">
            </div>
            <div class="form-group">
                <label>Type de lit</label>
                <select id="hotelRoomBed_${id}">
                    <option value="">Sélectionnez</option>
                    <option value="1 King">1 Lit King</option>
                    <option value="1 Queen">1 Lit Queen</option>
                    <option value="2 Simple">2 Lits Simple</option>
                    <option value="1 Double">1 Lit Double</option>
                    <option value="1 Double + 1 Simple">1 Double + 1 Simple</option>
                    <option value="3 Simple">3 Lits Simple</option>
                </select>
            </div>
            <div class="form-group">
                <label>Chambres disponibles</label>
                <input type="number" id="hotelRoomAvailable_${id}" min="1" max="100" value="${roomData.rooms_available || 1}">
            </div>
            <div class="form-group hotel-room-grid-full">
                <label>Vue</label>
                <select id="hotelRoomView_${id}">
                    <option value="">Aucune</option>
                    <option value="mer">Mer</option>
                    <option value="piscine">Piscine</option>
                    <option value="ville">Ville</option>
                    <option value="montagne">Montagne</option>
                    <option value="jardin">Jardin</option>
                </select>
            </div>
            <div class="form-group hotel-room-grid-full">
                <label>Salle de bain</label>
                <select id="hotelRoomBathroom_${id}">
                    <option value="">Sélectionnez</option>
                    <option value="douche">Douche</option>
                    <option value="baignoire">Baignoire</option>
                    <option value="douche_baignoire">Douche + Baignoire</option>
                </select>
            </div>
        </div>
    `;
    container.appendChild(card);
    if (roomData.bed_type) {
        const bedSelect = document.getElementById(`hotelRoomBed_${id}`);
        if (bedSelect) bedSelect.value = roomData.bed_type;
    }
    if (roomData.room_view) {
        const viewSelect = document.getElementById(`hotelRoomView_${id}`);
        if (viewSelect) viewSelect.value = roomData.room_view;
    }
    if (roomData.bathroom_type) {
        const bathSelect = document.getElementById(`hotelRoomBathroom_${id}`);
        if (bathSelect) bathSelect.value = roomData.bathroom_type;
    }
    scheduleLucideCreateIcons(card);
}

function removeHotelRoomField(cardId) {
    const card = document.getElementById(cardId);
    if (card) card.remove();
}

function collectHotelData() {
    const catEl = document.getElementById('listingCategory');
    const cat = catEl?.value || '';
    const sub = document.getElementById('listingSubcategory')?.value || '';
    if (normalizeListingCategory(cat, sub) !== 'Hébergement') return null;

    const services = Array.from(document.querySelectorAll('input[name="hotelService"]:checked')).map(cb => cb.value);
    const payments = Array.from(document.querySelectorAll('input[name="hotelPayment"]:checked')).map(cb => cb.value);

    const rooms = [];
    document.querySelectorAll('.hotel-room-card').forEach(card => {
        const id = card.id.split('_')[1];
        rooms.push({
            room_name: document.getElementById(`hotelRoomName_${id}`)?.value || '',
            price_per_night: parseFloat(document.getElementById(`hotelRoomPrice_${id}`)?.value) || 0,
            max_adults: parseInt(document.getElementById(`hotelRoomAdults_${id}`)?.value) || 2,
            max_children: parseInt(document.getElementById(`hotelRoomChildren_${id}`)?.value) || 0,
            bed_type: document.getElementById(`hotelRoomBed_${id}`)?.value || '',
            rooms_available: parseInt(document.getElementById(`hotelRoomAvailable_${id}`)?.value) || 1,
            room_view: document.getElementById(`hotelRoomView_${id}`)?.value || '',
            bathroom_type: document.getElementById(`hotelRoomBathroom_${id}`)?.value || ''
        });
    });

    return {
        stars: document.getElementById('hotelStars')?.value || '',
        check_in: document.getElementById('hotelCheckIn')?.value || '14:00',
        check_out: document.getElementById('hotelCheckOut')?.value || '12:00',
        cancellation: document.getElementById('hotelCancellation')?.value || 'free',
        free_cancellation_days: parseInt(document.getElementById('hotelFreeCancellationDays')?.value) || 0,
        children_policy: document.getElementById('hotelChildren')?.value || 'allowed',
        pets_policy: document.getElementById('hotelPets')?.value || 'not_allowed',
        smoking_policy: document.getElementById('hotelSmoking')?.value || 'not_allowed',
        whatsapp: document.getElementById('hotelWhatsApp')?.value || '',
        website: document.getElementById('hotelWebsite')?.value || '',
        license: document.getElementById('hotelLicense')?.value || '',
        min_stay: parseInt(document.getElementById('hotelMinStay')?.value) || 1,
        max_stay: parseInt(document.getElementById('hotelMaxStay')?.value) || 30,
        latitude: parseFloat(document.getElementById('hotelLat')?.value) || null,
        longitude: parseFloat(document.getElementById('hotelLng')?.value) || null,
        services,
        payments,
        rooms
    };
}

function populateAllExtraCategories() {
    const grid = document.getElementById('allCategoriesGrid');
    const combined = [...categories.filter(c => c.special !== 'other'), ...allExtraCategories];
    grid.innerHTML = combined.map(cat => `<div class="category-item" onclick="selectCategoryFromModal('${cat.name}')"><i data-lucide="${cat.icon}"></i><span>${cat.name}</span></div>`).join('');
    scheduleLucideCreateIcons(grid);
}

function openOtherCategoriesModal(clearTarget = false) {
    if (clearTarget) categoryPickerTargetSelectId = '';
    try {
        if (window.innerWidth <= 768) {
            setSidebarMobileOpen(false);
        }
    } catch (e) {
        null;
    }
    body.classList.add('other-categories-open');
    openModal('otherCategoriesModal');
    try {
        const modal = document.getElementById('otherCategoriesModal');
        const title = modal ? modal.querySelector('h2') : null;
        if (title && !title.dataset.boundClose) {
            title.dataset.boundClose = '1';
            title.style.cursor = 'pointer';
            title.addEventListener('click', () => closeModal('otherCategoriesModal'));
        }
    } catch (e) {
        null;
    }
    try {
        const input = document.getElementById('categorySearch');
        if (input) {
            input.value = '';
            filterCategories();
            if (!document.documentElement.classList.contains('is-touch-device')) {
                setTimeout(() => input.focus(), 80);
            }
        }
    } catch (e) {
        null;
    }
}

function openCategoryPicker(selectId) {
    const id = String(selectId || '').trim();
    if (!id) return;
    categoryPickerTargetSelectId = id;
    openOtherCategoriesModal(false);
}

let selectPickerTargetSelectId = '';
let selectPickerCachedOptions = [];
let selectPickerAnchorEl = null;
let selectPickerDropdownBound = false;
let selectPickerTitleBound = false;
let dropdownScrollLocked = false;
let dropdownScrollLockedY = 0;
let dropdownScrollHandlersBound = false;
let selectPickerSuppressOpenUntil = 0;
let selectPickerSuppressOpenId = '';

function isSelectPickerEventTargetInsideDropdown(target) {
    const modal = document.getElementById('selectPickerModal');
    if (!modal || !modal.classList.contains('active')) return false;
    const content = modal.querySelector('.modal-content');
    return !!content && content.contains(target);
}

function bindDropdownScrollLockHandlers() {
    if (dropdownScrollHandlersBound) return;
    dropdownScrollHandlersBound = true;

    window.addEventListener('scroll', () => {
        if (!dropdownScrollLocked) return;
        const y = dropdownScrollLockedY;
        const now = window.scrollY || window.pageYOffset || 0;
        if (Math.abs(now - y) < 2) return;
        window.scrollTo(0, y);
    }, { passive: true });

    document.addEventListener('wheel', (e) => {
        if (!dropdownScrollLocked) return;
        if (isSelectPickerEventTargetInsideDropdown(e.target)) return;
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!dropdownScrollLocked) return;
        if (isSelectPickerEventTargetInsideDropdown(e.target)) return;
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('keydown', (e) => {
        if (!dropdownScrollLocked) return;
        if (isSelectPickerEventTargetInsideDropdown(e.target)) return;
        const k = String(e.key || '');
        const block = [
            'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
            'PageUp', 'PageDown', 'Home', 'End', ' ',
            'Spacebar'
        ];
        if (!block.includes(k)) return;
        e.preventDefault();
    });
}

function lockDropdownScroll() {
    if (dropdownScrollLocked) return;
    dropdownScrollLocked = true;
    dropdownScrollLockedY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add('dropdown-open');
    document.body.classList.add('dropdown-open');
    bindDropdownScrollLockHandlers();
    window.scrollTo(0, dropdownScrollLockedY);
}

function unlockDropdownScroll() {
    if (!dropdownScrollLocked) return;
    dropdownScrollLocked = false;
    dropdownScrollLockedY = 0;
    document.documentElement.classList.remove('dropdown-open');
    document.body.classList.remove('dropdown-open');
}

function bindSelectPickerDropdown() {
    if (selectPickerDropdownBound) return;
    selectPickerDropdownBound = true;
    document.addEventListener('pointerdown', (e) => {
        const modal = document.getElementById('selectPickerModal');
        if (!modal || !modal.classList.contains('active')) return;
        const content = modal.querySelector('.modal-content');
        if (content && content.contains(e.target)) return;
        const id = String(selectPickerTargetSelectId || '').trim();
        const activeBtn = id ? document.querySelector(`.select-picker-btn[data-select-id="${CSS.escape(id)}"]`) : null;
        const nextBtn = e.target?.closest?.('.select-picker-btn') || null;
        if (nextBtn) {
            if (activeBtn && (nextBtn === activeBtn || activeBtn.contains(nextBtn))) {
                closeModal('selectPickerModal');
                selectPickerSuppressOpenId = id;
                selectPickerSuppressOpenUntil = Date.now() + 450;
                try {
                    e.preventDefault?.();
                    e.stopPropagation?.();
                } catch (err) {
                    null;
                }
                return;
            }
            const nextId = String(nextBtn.dataset.selectId || '').trim();
            closeModal('selectPickerModal');
            if (nextId) {
                try {
                    e.preventDefault?.();
                    e.stopPropagation?.();
                } catch (err) {
                    null;
                }
                setTimeout(() => openSelectPickerFor(nextId), 0);
                return;
            }
        }
        closeModal('selectPickerModal');
    }, true);

    document.addEventListener('keydown', (e) => {
        if (String(e.key || '') !== 'Escape') return;
        const modal = document.getElementById('selectPickerModal');
        if (!modal || !modal.classList.contains('active')) return;
        closeModal('selectPickerModal');
    });

    window.addEventListener('resize', () => {
        const modal = document.getElementById('selectPickerModal');
        if (!modal || !modal.classList.contains('active')) return;
        positionSelectPickerDropdown();
    });

    if (!selectPickerTitleBound) {
        selectPickerTitleBound = true;
        const title = document.getElementById('selectPickerTitle');
        if (title) {
            title.style.cursor = 'pointer';
            title.addEventListener('click', () => {
                const modal = document.getElementById('selectPickerModal');
                if (!modal || !modal.classList.contains('active')) return;
                closeModal('selectPickerModal');
            });
        }
    }
}

function positionSelectPickerDropdown() {
    const modal = document.getElementById('selectPickerModal');
    if (!modal) return;
    const content = modal.querySelector('.modal-content');
    if (!content) return;
    const anchor = selectPickerAnchorEl || content;
    const rect = anchor.getBoundingClientRect();
    const viewportW = window.innerWidth || document.documentElement.clientWidth || 0;
    const viewportH = window.innerHeight || document.documentElement.clientHeight || 0;
    const minW = 220;
    const margin = 8;
    let width = Math.max(minW, rect.width || minW);
    width = Math.min(width, Math.max(minW, viewportW - margin * 2));
    let left = rect.left;
    left = Math.max(margin, Math.min(left, viewportW - width - margin));

    content.style.left = `${Math.round(left)}px`;
    content.style.right = 'auto';
    content.style.width = `${Math.round(width)}px`;
    content.style.top = `${Math.round(rect.bottom + margin)}px`;
    content.style.bottom = 'auto';
    content.style.transform = 'none';

    const prevVisibility = content.style.visibility;
    content.style.visibility = 'hidden';
    const h = content.offsetHeight || 0;
    const preferAbove = (rect.bottom + margin + h > viewportH - margin) && rect.top > (viewportH - rect.bottom);
    let top = preferAbove ? (rect.top - h - margin) : (rect.bottom + margin);
    top = Math.max(margin, Math.min(top, viewportH - h - margin));
    content.style.top = `${Math.round(top)}px`;
    content.style.visibility = prevVisibility;
}

function getSelectPickerLabelForSelect(selectEl) {
    if (!selectEl) return 'Sélectionnez';
    const group = selectEl.closest('.form-group');
    const label = group ? group.querySelector('label') : null;
    const txt = label ? String(label.textContent || '').trim() : '';
    return txt || 'Sélectionnez';
}

function getSelectPlaceholderText(selectEl) {
    if (!selectEl) return 'Sélectionnez';
    const first = selectEl.querySelector('option');
    if (!first) return 'Sélectionnez';
    const t = String(first.textContent || '').trim();
    return t || 'Sélectionnez';
}

function getPickerButtonForSelect(selectEl) {
    if (!selectEl) return null;
    const id = selectEl.id;
    if (!id) return null;
    return document.querySelector(`.select-picker-btn[data-select-id="${CSS.escape(id)}"]`);
}

function refreshSelectPicker(selectEl) {
    if (!selectEl) return;
    const btn = getPickerButtonForSelect(selectEl);
    if (!btn) return;
    const value = String(selectEl.value || '').trim();
    const selectedOpt = Array.from(selectEl.options).find((opt) => opt.value === value);
    const text = selectedOpt ? String(selectedOpt.textContent || '').trim() : '';
    btn.textContent = text || getSelectPlaceholderText(selectEl);
    btn.disabled = !!selectEl.disabled;
}

function enhanceSelectToPicker(selectEl) {
    if (!selectEl || !selectEl.id) return;
    if (selectEl.dataset.pickerEnhanced === '1') return;
    selectEl.dataset.pickerEnhanced = '1';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'select-picker-btn';
    btn.id = `${selectEl.id}__pickerBtn`;
    btn.dataset.selectId = selectEl.id;
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-controls', 'selectPickerModal');
    btn.addEventListener('click', () => openSelectPickerFor(selectEl.id));

    selectEl.classList.add('select-picker-hidden');
    selectEl.tabIndex = -1;
    selectEl.setAttribute('aria-hidden', 'true');
    selectEl.parentNode.insertBefore(btn, selectEl);

    selectEl.addEventListener('change', () => refreshSelectPicker(selectEl));
    const intercept = (e) => {
        try {
            e.preventDefault?.();
            e.stopPropagation?.();
        } catch (err) {
            null;
        }
        try {
            selectEl.blur?.();
        } catch (err) {
            null;
        }
        openSelectPickerFor(selectEl.id);
    };
    ['pointerdown', 'mousedown', 'touchstart', 'click'].forEach((evt) => {
        selectEl.addEventListener(evt, intercept, { passive: false });
    });
    selectEl.addEventListener('focus', () => {
        try {
            selectEl.blur?.();
        } catch (err) {
            null;
        }
    });
    const labels = Array.from(document.querySelectorAll(`label[for="${CSS.escape(selectEl.id)}"]`));
    labels.forEach((lab) => {
        try {
            lab.setAttribute('for', btn.id);
        } catch (err) {
            null;
        }
    });
    refreshSelectPicker(selectEl);
}

function shouldAutoScrollPickerAnchor() {
    return window.matchMedia('(max-width: 768px)').matches;
}

function getPickerScrollTopForAnchor(anchor) {
    const el = anchor || null;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const navbar = document.querySelector('.navbar');
    const navH = navbar ? navbar.offsetHeight || 0 : 0;
    const padding = 16;
    const desiredTop = navH + padding;
    const currentTop = rect.top;
    if (currentTop <= desiredTop + 6) return null;
    const target = (window.scrollY || window.pageYOffset || 0) + currentTop - desiredTop;
    return Math.max(0, Math.round(target));
}

function openSelectPickerFor(selectId) {
    const id = String(selectId || '').trim();
    if (!id) return;
    if (selectPickerSuppressOpenId === id && Date.now() < selectPickerSuppressOpenUntil) return;
    const select = document.getElementById(id);
    if (!select || select.disabled) return;
    selectPickerTargetSelectId = id;
    const title = document.getElementById('selectPickerTitle');
    if (title) title.textContent = getSelectPickerLabelForSelect(select);
    const search = document.getElementById('selectPickerSearch');
    if (search) search.value = '';

    const options = Array.from(select.options)
        .filter((opt) => !opt.disabled && String(opt.value || '').trim() !== '')
        .map((opt) => ({
            value: String(opt.value || ''),
            label: String(opt.textContent || '').trim()
        }));
    selectPickerCachedOptions = options;
    renderSelectPickerOptions(options, String(select.value || ''));
    bindSelectPickerDropdown();
    const modal = document.getElementById('selectPickerModal');
    if (!modal) return;
    const content = modal.querySelector('.modal-content');
    if (!content) return;
    selectPickerAnchorEl = getPickerButtonForSelect(select) || select;
    const openNow = () => {
        modal.classList.add('active');
        lockDropdownScroll();
        positionSelectPickerDropdown();
        setTimeout(positionSelectPickerDropdown, 160);
        setTimeout(positionSelectPickerDropdown, 420);
    };
    if (shouldAutoScrollPickerAnchor()) {
        const top = getPickerScrollTopForAnchor(selectPickerAnchorEl);
        if (typeof top === 'number') {
            try {
                window.scrollTo({ top, behavior: 'auto' });
            } catch (e) {
                window.scrollTo(0, top);
            }
            setTimeout(openNow, 40);
        } else {
            openNow();
        }
    } else {
        openNow();
    }
    scheduleLucideCreateIcons(document.getElementById('selectPickerModal'));
}

function renderSelectPickerOptions(options, currentValue) {
    const list = document.getElementById('selectPickerList');
    if (!list) return;
    const cur = String(currentValue || '');
    if (!list.dataset.boundChoose) {
        list.dataset.boundChoose = '1';
        list.addEventListener('click', (e) => {
            const btn = e?.target?.closest?.('.select-picker-option');
            if (!btn) return;
            selectPickerChoose(String(btn.dataset.value || ''));
        });
    }
    list.innerHTML = (options || []).map((opt) => {
        const active = String(opt.value) === cur ? ' active' : '';
        const safeValue = escapeHtml(String(opt.value || ''));
        const safeLabel = String(opt.label).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<button type="button" class="select-picker-option${active}" data-value="${safeValue}">${safeLabel}</button>`;
    }).join('');
}

function filterSelectPickerOptions() {
    const search = document.getElementById('selectPickerSearch');
    const term = search ? String(search.value || '').toLowerCase().trim() : '';
    const select = document.getElementById(String(selectPickerTargetSelectId || '').trim());
    const currentValue = select ? String(select.value || '') : '';
    const filtered = term
        ? selectPickerCachedOptions.filter((o) => String(o.label || '').toLowerCase().includes(term))
        : selectPickerCachedOptions;
    renderSelectPickerOptions(filtered, currentValue);
}

function selectPickerChoose(value) {
    const id = String(selectPickerTargetSelectId || '').trim();
    const select = document.getElementById(id);
    if (!select) return;
    select.value = value;
    try {
        select.dispatchEvent(new Event('change', { bubbles: true }));
    } catch (e) {
        null;
    }
    refreshSelectPicker(select);
    selectPickerTargetSelectId = '';
    closeModal('selectPickerModal');
}

function setupSelectPickers() {
    const selectors = [
        '#create-listing-section select',
        '#editProfileModal select',
        '#editListingModal select',
        '#sortSelect',
        '#filterWilaya',
        '#filterCategory'
    ];
    const nodes = selectors.flatMap((sel) => Array.from(document.querySelectorAll(sel)));
    nodes.forEach((el) => enhanceSelectToPicker(el));
    nodes.forEach((el) => refreshSelectPicker(el));
}

function setupCategoryPickers() {
    const ids = [];
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        let lastOpenAt = 0;
        const open = (e) => {
            try {
                e.preventDefault();
                e.stopPropagation();
            } catch (err) {
                null;
            }
            const now = Date.now();
            if (now - lastOpenAt < 400) return;
            lastOpenAt = now;
            try {
                el.blur();
            } catch (err) {
                null;
            }
            openCategoryPicker(id);
        };
        el.addEventListener('touchstart', open, { passive: false });
        el.addEventListener('pointerdown', open);
        el.addEventListener('mousedown', open);
        el.addEventListener('click', open);
        el.addEventListener('focus', open);
        el.addEventListener('keydown', (e) => {
            const k = String(e.key || '');
            if (k === 'Enter' || k === ' ' || k === 'ArrowDown') open(e);
        });
    });
}

function selectCategoryFromModal(categoryName) {
    const targetId = String(categoryPickerTargetSelectId || '').trim();
    if (targetId) {
        const select = document.getElementById(targetId);
        if (select) {
            const exists = Array.from(select.options).some((opt) => opt.value === categoryName);
            if (!exists) {
                const option = document.createElement('option');
                option.value = categoryName;
                option.textContent = categoryName;
                select.appendChild(option);
            }
            select.value = categoryName;
            try {
                select.dispatchEvent(new Event('change', { bubbles: true }));
            } catch (e) {
                null;
            }
        }
        categoryPickerTargetSelectId = '';
        closeModal('otherCategoriesModal');
        return;
    }
    const filterCategory = document.getElementById('filterCategory');
    const existsInFilter = Array.from(filterCategory.options).some(opt => opt.value === categoryName);
    if (!existsInFilter) {
        const option = document.createElement('option');
        option.value = categoryName;
        option.textContent = categoryName;
        filterCategory.appendChild(option);
    }

    closeModal('otherCategoriesModal');
    filterByCategory(categoryName, null);
}

function filterCategories() {
    const searchTerm = document.getElementById('categorySearch').value.toLowerCase();
    const items = document.querySelectorAll('#allCategoriesGrid .category-item');
    items.forEach(item => {
        const name = item.querySelector('span').textContent.toLowerCase();
        item.style.display = name.includes(searchTerm) ? 'flex' : 'none';
    });
}

function revokeListingImageUrl(index) {
    const url = selectedListingImageUrls[index];
    if (url) {
        try {
            URL.revokeObjectURL(url);
        } catch (e) {
            null;
        }
    }
    selectedListingImageUrls[index] = '';
}

function removeListingImageSlot(event, index) {
    try {
        event?.preventDefault?.();
        event?.stopPropagation?.();
    } catch (e) {
        null;
    }
    const idx = Math.max(0, Math.min(MAX_LISTING_IMAGES - 1, Number(index) || 0));
    if (selectedListingImageSources[idx] === 'new') {
        revokeListingImageUrl(idx);
    } else {
        selectedListingImageUrls[idx] = '';
    }
    selectedListingImages[idx] = null;
    selectedListingImageSources[idx] = '';
    renderListingImagesSlots();
    updateListingImagesMiniPreview();
}

function updateListingImagesMiniPreview() {
    const preview = document.getElementById('imagePreviewContainer');
    if (!preview) return;
    const urls = selectedListingImageUrls.filter(Boolean);
    if (urls.length === 0) {
        preview.innerHTML = '';
        preview.style.display = 'none';
        return;
    }
    preview.style.display = 'flex';
    preview.innerHTML = urls
        .slice(0, 5)
        .map((u) => `<img src="${u}" alt="" style="width:42px;height:42px;object-fit:cover;border-radius:10px;">`)
        .join('') + (urls.length > 5 ? `<div style="display:flex;align-items:center;justify-content:center;width:42px;height:42px;border-radius:10px;background:var(--light-gray);color:var(--text-muted);font-weight:800;">+${urls.length - 5}</div>` : '');
}

function resetCreateListingDraft({ resetForm = true } = {}) {
    selectedListingImages.forEach((_, i) => revokeListingImageUrl(i));
    selectedListingImages = Array.from({ length: MAX_LISTING_IMAGES }, () => null);
    selectedListingImageUrls = Array.from({ length: MAX_LISTING_IMAGES }, () => '');
    selectedListingImageSources = Array.from({ length: MAX_LISTING_IMAGES }, () => '');
    currentListingImageSlotIndex = 0;
    removeSelectedListingVideo();
    try {
        renderListingImagesSlots();
    } catch (e) {
        null;
    }
    try {
        updateListingImagesMiniPreview();
    } catch (e) {
        null;
    }
    if (resetForm) {
        const form = document.getElementById('addListingForm');
        form?.reset?.();
        const city = document.getElementById('listingCity');
        const wilaya = document.getElementById('listingWilaya');
        if (city) populateCitySelect(city, wilaya?.value || '', '');
        const sub = document.getElementById('listingSubcategory');
        const cat = document.getElementById('listingCategory');
        if (sub) populateListingSubcategorySelect(sub, cat?.value || '', '');
        const priceType = document.getElementById('listingPriceType');
        const price = document.getElementById('listingPrice');
        if (priceType && price) {
            price.disabled = priceType.value === 'Free';
            if (priceType.value === 'Free') price.value = '0';
        }
        try {
            renderListingDynamicFields({});
        } catch (e) {
            null;
        }
    }
}

function renderListingImagesSlots() {
    const container = document.getElementById('listingImagesSlots');
    if (!container) return;
    container.innerHTML = Array.from({ length: MAX_LISTING_IMAGES }, (_, i) => {
        const url = selectedListingImageUrls[i];
        if (url) {
            return `<div class="listing-image-slot" role="button" tabindex="0" onclick="selectListingImageSlot(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectListingImageSlot(${i});}"><img src="${url}" alt=""><button type="button" class="listing-image-remove" onclick="removeListingImageSlot(event, ${i})" aria-label="Remove image"><i data-lucide="x"></i></button></div>`;
        }
        return `<div class="listing-image-slot" role="button" tabindex="0" onclick="selectListingImageSlot(${i})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selectListingImageSlot(${i});}"><div class="slot-label"><i data-lucide="plus"></i><span>${i + 1}</span></div></div>`;
    }).join('');
    scheduleLucideCreateIcons(container);
}

function lockDocumentScrollForSidebar() {
    if (sidebarScrollLocked) return;
    if (document.body.classList.contains('modal-open')) return;
    sidebarScrollLockTop = window.scrollY || window.pageYOffset || 0;
    sidebarScrollLocked = true;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${sidebarScrollLockTop}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
}

function unlockDocumentScrollForSidebar() {
    if (!sidebarScrollLocked) return;
    sidebarScrollLocked = false;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, sidebarScrollLockTop || 0);
}

function lockDocumentScrollForModal(modalId = '') {
    if (modalScrollLocked) return;
    if (document.body.classList.contains('sidebar-open')) return;
    const id = String(modalId || '');
    modalScrollLockPrevBodyPaddingRight = '';
    modalScrollLockBodyPaddingRightApplied = false;
    if (window.innerWidth > 768 && id === 'otherCategoriesModal') {
        try {
            const scrollbarWidth = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
            if (scrollbarWidth > 0) {
                modalScrollLockPrevBodyPaddingRight = document.body.style.paddingRight || '';
                const computed = Number.parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
                document.body.style.paddingRight = `${computed + scrollbarWidth}px`;
                modalScrollLockBodyPaddingRightApplied = true;
            }
        } catch (e) {
            null;
        }
    }
    modalScrollLockTop = window.scrollY || window.pageYOffset || 0;
    modalScrollLocked = true;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${modalScrollLockTop}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
}

function unlockDocumentScrollForModal() {
    if (!modalScrollLocked) return;
    modalScrollLocked = false;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    if (modalScrollLockBodyPaddingRightApplied) {
        document.body.style.paddingRight = modalScrollLockPrevBodyPaddingRight;
        modalScrollLockBodyPaddingRightApplied = false;
        modalScrollLockPrevBodyPaddingRight = '';
    }
    window.scrollTo(0, modalScrollLockTop || 0);
}

function selectListingImageSlot(index) {
    currentListingImageSlotIndex = index;
    const input = document.getElementById('listingImageSlotInput');
    if (!input) return;
    input.click();
}

document.getElementById('listingImageSlotInput')?.addEventListener('change', (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    const idx = Math.max(0, Math.min(MAX_LISTING_IMAGES - 1, currentListingImageSlotIndex || 0));
    revokeListingImageUrl(idx);
    selectedListingImages[idx] = file;
    selectedListingImageUrls[idx] = URL.createObjectURL(file);
    selectedListingImageSources[idx] = 'new';
    renderListingImagesSlots();
    updateListingImagesMiniPreview();
    e.target.value = '';
});

function setSidebarMobileOpen(isOpen) {
    if (isOpen) sidebar.classList.remove('collapsed');
    else sidebar.classList.add('collapsed');
    sidebar.classList.toggle('active', !!isOpen);
    const overlay = document.getElementById('sidebarOverlay');
    overlay?.classList?.toggle('active', !!isOpen);
    try {
        document.body.classList.toggle('sidebar-open', !!isOpen);
        document.documentElement.classList.toggle('sidebar-open', !!isOpen);
    } catch (e) {
        null;
    }
    if (isOpen) lockDocumentScrollForSidebar();
    else unlockDocumentScrollForSidebar();
}

function closeSidebarOverlay() {
    setSidebarMobileOpen(false);
}

sidebarToggle.addEventListener('click', () => {
    setSidebarMobileOpen(!sidebar.classList.contains('active'));
});

if (!window.__winjaySidebarTouchLocked) {
    window.__winjaySidebarTouchLocked = true;
    document.addEventListener(
        'touchmove',
        (e) => {
            if (!document.body.classList.contains('sidebar-open')) return;
            const side = document.getElementById('sidebar');
            if (side && side.contains(e.target)) return;
            e.preventDefault();
        },
        { passive: false }
    );
}

themeToggle.addEventListener('click', () => {
    setThemeMode(!isDarkMode);
});

function openModal(modalId) {
    const protectedModals = [
        'editListingModal',
        'editProfileModal',
        'changePasswordModal',
        'identityVerificationModal',
        'verifiedCongratsModal',
        'notificationsModal'
    ];
    if (protectedModals.includes(modalId) && !requireAuthOrPrompt()) return;
    const el = document.getElementById(modalId);
    if (!el) return;
    el.classList.add('active');
    body.classList.add('modal-open');
    lockDocumentScrollForModal(modalId);
    if (modalId === 'notificationsModal') {
        renderNotificationsModal().then(() => markAllNotificationsRead()).then(() => refreshUnreadNotificationCount());
    }
    try {
        updateUpgradeOfferVisibility();
        updateFreeVerifiedPrimaryAction();
    } catch (e) {
        null;
    }
}

function closeModal(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
    if (modalId === 'contactModal') {
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete('modal');
            const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');
            history.replaceState(history.state || null, '', next);
        } catch (e) {
            null;
        }
    }
    if (modalId === 'confirmModal') {
        confirmCallback = null;
    }
    if (modalId === 'otherCategoriesModal') {
        categoryPickerTargetSelectId = '';
        body.classList.remove('other-categories-open');
    }
    if (modalId === 'selectPickerModal') {
        selectPickerTargetSelectId = '';
        selectPickerCachedOptions = [];
        selectPickerAnchorEl = null;
        unlockDropdownScroll();
        try {
            const content = el ? el.querySelector('.modal-content') : null;
            if (content) {
                content.style.left = '';
                content.style.right = '';
                content.style.top = '';
                content.style.bottom = '';
                content.style.width = '';
                content.style.transform = '';
                content.style.visibility = '';
            }
        } catch (e) {
            null;
        }
    }
    if (!document.querySelector('.modal.active')) {
        body.classList.remove('modal-open');
        unlockDocumentScrollForModal();
    }
}

function openListingLimitModal(limit = FREE_LISTING_LIMIT) {
    const messageEl = document.getElementById('listingLimitMessage');
    if (messageEl) messageEl.textContent = `You reached your listing limit of ${limit}.`;
    openModal('listingLimitModal');
    scheduleLucideCreateIcons(document.getElementById('listingLimitModal'));
}

function upgradeToVipFromListingLimit() {
    closeModal('listingLimitModal');
    showSection('home-section');
    openVipModal();
    scheduleLucideCreateIcons();
}

function upgradeToVerifiedFromListingLimit() {
    closeModal('listingLimitModal');
    showSection('home-section');
    openVerifiedUpgradeModal();
    scheduleLucideCreateIcons();
}

function closeProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    const btn = document.getElementById('profileBtn');
    dropdown?.classList.remove('active');
    btn?.setAttribute('aria-expanded', 'false');
}

function toggleProfileDropdown(e) {
    e?.stopPropagation();
    const dropdown = document.getElementById('profileDropdown');
    const btn = document.getElementById('profileBtn');
    if (!dropdown || !btn) return;
    const next = !dropdown.classList.contains('active');
    dropdown.classList.toggle('active', next);
    btn.setAttribute('aria-expanded', next ? 'true' : 'false');
    if (next) scheduleLucideCreateIcons(dropdown);
}

function showConfirmModal(title, message, callback, isDanger = false, okText = 'Confirmer', cancelText = 'Annuler') {
    document.getElementById('confirmTitle').textContent = title;
    document.getElementById('confirmMessage').textContent = message;
    confirmCallback = callback;
    const okBtn = document.getElementById('confirmOkBtn');
    okBtn.textContent = okText;
    const cancelBtn = document.querySelector('#confirmModal .confirm-cancel-btn');
    if (cancelBtn) cancelBtn.textContent = cancelText;
    if (isDanger) {
        okBtn.classList.add('danger');
    } else {
        okBtn.classList.remove('danger');
    }
    openModal('confirmModal');
}

function setPendingSectionAfterAuth(sectionId) {
    const id = String(sectionId || '').trim();
    if (!id) return;
    try {
        sessionStorage.setItem(AUTH_PENDING_SECTION_KEY, id);
    } catch (e) {
        null;
    }
}

function consumePendingSectionAfterAuth() {
    try {
        const id = sessionStorage.getItem(AUTH_PENDING_SECTION_KEY);
        sessionStorage.removeItem(AUTH_PENDING_SECTION_KEY);
        return String(id || '').trim() || null;
    } catch (e) {
        return null;
    }
}

function maybeOpenPendingSectionAfterAuth() {
    if (!isLoggedIn()) return;
    const sectionId = consumePendingSectionAfterAuth();
    if (!sectionId) return;
    showSection(sectionId);
}

function openAuthGateLogin() {
    closeModal('authGateModal');
    openModal('loginModal');
    scheduleLucideCreateIcons(document.getElementById('loginModal'));
}

function openAuthGateRegister() {
    closeModal('authGateModal');
    openModal('registerModal');
    scheduleLucideCreateIcons(document.getElementById('registerModal'));
}

function closeConfirmModal() {
    closeModal('confirmModal');
    confirmCallback = null;
}

function confirmAction() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeConfirmModal();
}

const PROFILE_IMAGES_STORAGE_KEY = 'winjayProfileImagesV1';
const PROFILE_IMAGES_TEMP_STORAGE_KEY = 'winjayProfileImagesTempV1';

let currentImageType = null;
let currentImageData = null;
let currentZoom = 1;
let currentOffsetX = 0;
let currentOffsetY = 0;
let isDraggingEditorImage = false;
let dragStartX = 0;
let dragStartY = 0;
let dragStartOffsetX = 0;
let dragStartOffsetY = 0;
let activeEditorPointerId = null;

function loadUserProfileImages() {
    try {
        const canApplyPersistentLocal = !(supabaseClient && currentSupabaseUserId);
        if (canApplyPersistentLocal) {
            const raw = localStorage.getItem(PROFILE_IMAGES_STORAGE_KEY);
            if (raw) {
                const saved = JSON.parse(raw);
                if (saved?.avatar?.cropped) userProfile.profilePic = saved.avatar.cropped;
                if (saved?.cover?.cropped) userProfile.coverPic = saved.cover.cropped;
            }
        }

        const tempRaw = sessionStorage.getItem(PROFILE_IMAGES_TEMP_STORAGE_KEY);
        if (tempRaw) {
            const tempSaved = JSON.parse(tempRaw);
            if (tempSaved?.avatar?.cropped) userProfile.profilePic = tempSaved.avatar.cropped;
            if (tempSaved?.cover?.cropped) userProfile.coverPic = tempSaved.cover.cropped;
        }
    } catch (e) {
        return;
    }
}

function saveUserProfileImages(payload) {
    try {
        localStorage.setItem(PROFILE_IMAGES_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
        return;
    }
}

function openImageEditor(type) {
    currentImageType = type;
    const title = type === 'cover' ? 'Choose cover photo' : 'Choose profile picture';
    const titleEl = document.getElementById('imageChooserTitle');
    if (titleEl) titleEl.textContent = title;
    openModal('imageChooserModal');
    scheduleLucideCreateIcons(document.getElementById('imageChooserModal'));
}

function triggerImageUpload() {
    const inputId = currentImageType === 'cover' ? 'coverInput' : 'profilePicInput';
    const input = document.getElementById(inputId);
    if (!input) return;
    input.click();
}

document.getElementById('coverInput').addEventListener('change', handleImageSelect);
document.getElementById('profilePicInput').addEventListener('change', handleImageSelect);

function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        currentImageData = event.target.result;
        currentZoom = 1;
        currentOffsetX = 0;
        currentOffsetY = 0;

        document.getElementById('imageZoom').value = 1;

        const preview = document.getElementById('imagePreviewWrapper');
        preview.classList.remove('avatar');
        if (currentImageType === 'avatar') {
            preview.classList.add('avatar');
            document.getElementById('imageEditorTitle').textContent = 'Choose profile picture';
        } else {
            document.getElementById('imageEditorTitle').textContent = 'Choose cover photo';
        }

        const img = document.getElementById('imageEditorPreview');
        img.onload = () => {
            fitEditorImageToFrame();
            updateImagePreview();
        };
        img.src = currentImageData;
        closeModal('imageChooserModal');
        openModal('imageEditorModal');
        scheduleLucideCreateIcons(document.getElementById('imageEditorModal'));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
}

function fitEditorImageToFrame() {
    const frame = document.getElementById('imagePreviewWrapper');
    const img = document.getElementById('imageEditorPreview');
    const frameW = frame.clientWidth || 300;
    const frameH = frame.clientHeight || 200;
    const nw = img.naturalWidth || frameW;
    const nh = img.naturalHeight || frameH;
    const imgRatio = nw / nh;
    const frameRatio = frameW / frameH;

    let baseW;
    let baseH;
    if (imgRatio > frameRatio) {
        baseH = frameH;
        baseW = frameH * imgRatio;
    } else {
        baseW = frameW;
        baseH = frameW / imgRatio;
    }

    img.style.width = `${baseW}px`;
    img.style.height = `${baseH}px`;
}

function updateImagePreview() {
    currentZoom = parseFloat(document.getElementById('imageZoom').value);
    const img = document.getElementById('imageEditorPreview');
    img.style.transform = `translate(-50%, -50%) translate(${currentOffsetX}px, ${currentOffsetY}px) scale(${currentZoom})`;
}

function dataUrlToBlob(dataUrl) {
    try {
        const raw = String(dataUrl || '');
        const parts = raw.split(',');
        if (parts.length < 2) return null;
        const match = parts[0].match(/data:(.*?);base64/i);
        const mime = match?.[1] || 'image/png';
        const binary = atob(parts[1]);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return new Blob([bytes], { type: mime });
    } catch (e) {
        return null;
    }
}

async function uploadCroppedProfileImageToSupabase(type, croppedDataUrl) {
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) return null;
    const blob = dataUrlToBlob(croppedDataUrl);
    if (!blob) return null;
    const ext = blob.type === 'image/jpeg' ? 'jpg' : 'png';
    const objectPath = `${currentSupabaseUserId}/${type}_${Date.now()}.${ext}`;
    const { error: uploadErr } = await client.storage
        .from(PROFILE_IMAGES_BUCKET)
        .upload(objectPath, blob, { cacheControl: '3600', upsert: true, contentType: blob.type || undefined });
    if (uploadErr) {
        showToast(uploadErr.message || 'Failed to upload image', 'alert-circle');
        return null;
    }
    const { data: publicData } = client.storage.from(PROFILE_IMAGES_BUCKET).getPublicUrl(objectPath);
    const publicUrl = publicData?.publicUrl || '';
    if (!publicUrl) return null;
    const payload = { id: currentSupabaseUserId };
    if (type === 'cover') payload.cover_url = publicUrl;
    else payload.avatar_url = publicUrl;
    const { error: saveErr } = await client.from('profiles').upsert(payload, { onConflict: 'id' });
    if (saveErr) {
        showToast(saveErr.message || 'Failed to save profile image', 'alert-circle');
        return null;
    }
    return publicUrl;
}

async function applyImageChanges() {
    const exported = exportCroppedEditorImage(currentImageType);
    if (!exported) return;

    if (currentImageType === 'cover') {
        userProfile.coverPic = exported;
    } else {
        userProfile.profilePic = exported;
    }

    updateProfileUI();
    persistProfileImageState(currentImageType, exported);
    clearTemporaryProfileImageState(currentImageType);
    closeModal('imageEditorModal');
    const uploadedUrl = await uploadCroppedProfileImageToSupabase(currentImageType, exported);
    if (uploadedUrl) {
        if (currentImageType === 'cover') userProfile.coverPic = uploadedUrl;
        else userProfile.profilePic = uploadedUrl;
        updateProfileUI();
        showToast('Photo saved!', 'check-circle');
    } else {
        showToast('Photo updated!', 'check-circle');
    }
}

function persistProfileImageState(type, croppedDataUrl) {
    try {
        const raw = localStorage.getItem(PROFILE_IMAGES_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : {};
        const next = {
            ...existing,
            [type === 'cover' ? 'cover' : 'avatar']: {
                original: currentImageData,
                cropped: croppedDataUrl,
                zoom: currentZoom,
                offsetX: currentOffsetX,
                offsetY: currentOffsetY
            }
        };
        saveUserProfileImages(next);
    } catch (e) {
        return;
    }
}

function persistTemporaryProfileImageState(type, croppedDataUrl) {
    try {
        const raw = sessionStorage.getItem(PROFILE_IMAGES_TEMP_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : {};
        const next = {
            ...existing,
            [type === 'cover' ? 'cover' : 'avatar']: {
                original: currentImageData,
                cropped: croppedDataUrl,
                zoom: currentZoom,
                offsetX: currentOffsetX,
                offsetY: currentOffsetY
            }
        };
        sessionStorage.setItem(PROFILE_IMAGES_TEMP_STORAGE_KEY, JSON.stringify(next));
    } catch (e) {
        return;
    }
}

function clearTemporaryProfileImageState(type) {
    try {
        const raw = sessionStorage.getItem(PROFILE_IMAGES_TEMP_STORAGE_KEY);
        if (!raw) return;
        const existing = JSON.parse(raw) || {};
        const key = type === 'cover' ? 'cover' : 'avatar';
        if (!(key in existing)) return;
        delete existing[key];
        if (!Object.keys(existing).length) {
            sessionStorage.removeItem(PROFILE_IMAGES_TEMP_STORAGE_KEY);
            return;
        }
        sessionStorage.setItem(PROFILE_IMAGES_TEMP_STORAGE_KEY, JSON.stringify(existing));
    } catch (e) {
        return;
    }
}

function exportCroppedEditorImage(type) {
    const frame = document.getElementById('imagePreviewWrapper');
    const img = document.getElementById('imageEditorPreview');
    if (!img?.naturalWidth || !img?.naturalHeight) return null;

    const frameRect = frame.getBoundingClientRect();
    const imgRect = img.getBoundingClientRect();

    const scaleX = img.naturalWidth / imgRect.width;
    const scaleY = img.naturalHeight / imgRect.height;

    let sx = (frameRect.left - imgRect.left) * scaleX;
    let sy = (frameRect.top - imgRect.top) * scaleY;
    let sw = frameRect.width * scaleX;
    let sh = frameRect.height * scaleY;

    if (sw <= 0 || sh <= 0) return null;

    if (sx < 0) {
        sw += sx;
        sx = 0;
    }
    if (sy < 0) {
        sh += sy;
        sy = 0;
    }
    sw = Math.min(sw, img.naturalWidth - sx);
    sh = Math.min(sh, img.naturalHeight - sy);
    if (sw <= 0 || sh <= 0) return null;

    const canvas = document.createElement('canvas');
    if (type === 'cover') {
        canvas.width = 1200;
        canvas.height = 400;
    } else {
        canvas.width = 512;
        canvas.height = 512;
    }

    const targetAspect = canvas.width / canvas.height;
    const cropAspect = sw / sh;
    if (Number.isFinite(targetAspect) && Number.isFinite(cropAspect) && targetAspect > 0 && cropAspect > 0) {
        if (cropAspect > targetAspect) {
            const nextSw = sh * targetAspect;
            sx += (sw - nextSw) / 2;
            sw = nextSw;
        } else if (cropAspect < targetAspect) {
            const nextSh = sw / targetAspect;
            sy += (sh - nextSh) / 2;
            sh = nextSh;
        }

        sx = Math.max(0, Math.min(sx, img.naturalWidth));
        sy = Math.max(0, Math.min(sy, img.naturalHeight));
        sw = Math.min(sw, img.naturalWidth - sx);
        sh = Math.min(sh, img.naturalHeight - sy);
        if (sw <= 0 || sh <= 0) return null;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const mime = type === 'cover' ? 'image/jpeg' : 'image/png';
    return canvas.toDataURL(mime, type === 'cover' ? 0.92 : undefined);
}

function resetImageEditor() {
    currentZoom = 1;
    currentOffsetX = 0;
    currentOffsetY = 0;
    document.getElementById('imageZoom').value = 1;
    fitEditorImageToFrame();
    updateImagePreview();
}

function closeImageEditor() {
    closeModal('imageEditorModal');
    currentImageData = null;
    currentImageType = null;
    currentZoom = 1;
    currentOffsetX = 0;
    currentOffsetY = 0;
}

function setupImageEditorDrag() {
    const frame = document.getElementById('imagePreviewWrapper');
    if (!frame) return;

    const onPointerDown = (e) => {
        if (!currentImageData) return;
        isDraggingEditorImage = true;
        activeEditorPointerId = e.pointerId;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartOffsetX = currentOffsetX;
        dragStartOffsetY = currentOffsetY;
        frame.setPointerCapture(activeEditorPointerId);
        frame.style.cursor = 'grabbing';
    };

    const onPointerMove = (e) => {
        if (!isDraggingEditorImage || e.pointerId !== activeEditorPointerId) return;
        currentOffsetX = dragStartOffsetX + (e.clientX - dragStartX);
        currentOffsetY = dragStartOffsetY + (e.clientY - dragStartY);
        updateImagePreview();
    };

    const onPointerUp = (e) => {
        if (e.pointerId !== activeEditorPointerId) return;
        isDraggingEditorImage = false;
        activeEditorPointerId = null;
        frame.style.cursor = 'grab';
    };

    frame.addEventListener('pointerdown', onPointerDown);
    frame.addEventListener('pointermove', onPointerMove);
    frame.addEventListener('pointerup', onPointerUp);
    frame.addEventListener('pointercancel', onPointerUp);

    const onMouseDown = (e) => {
        if (!currentImageData) return;
        isDraggingEditorImage = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        dragStartOffsetX = currentOffsetX;
        dragStartOffsetY = currentOffsetY;
        frame.style.cursor = 'grabbing';
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e) => {
        if (!isDraggingEditorImage) return;
        currentOffsetX = dragStartOffsetX + (e.clientX - dragStartX);
        currentOffsetY = dragStartOffsetY + (e.clientY - dragStartY);
        updateImagePreview();
    };

    const onMouseUp = () => {
        isDraggingEditorImage = false;
        frame.style.cursor = 'grab';
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
    };

    const getTouchPoint = (e) => e.touches?.[0] || e.changedTouches?.[0] || null;

    const onTouchStart = (e) => {
        if (!currentImageData) return;
        const t = getTouchPoint(e);
        if (!t) return;
        isDraggingEditorImage = true;
        dragStartX = t.clientX;
        dragStartY = t.clientY;
        dragStartOffsetX = currentOffsetX;
        dragStartOffsetY = currentOffsetY;
        frame.style.cursor = 'grabbing';
    };

    const onTouchMove = (e) => {
        if (!isDraggingEditorImage) return;
        const t = getTouchPoint(e);
        if (!t) return;
        e.preventDefault();
        currentOffsetX = dragStartOffsetX + (t.clientX - dragStartX);
        currentOffsetY = dragStartOffsetY + (t.clientY - dragStartY);
        updateImagePreview();
    };

    const onTouchEnd = () => {
        isDraggingEditorImage = false;
        frame.style.cursor = 'grab';
    };

    frame.addEventListener('mousedown', onMouseDown);
    frame.addEventListener('touchstart', onTouchStart, { passive: true });
    frame.addEventListener('touchmove', onTouchMove, { passive: false });
    frame.addEventListener('touchend', onTouchEnd);
    frame.addEventListener('touchcancel', onTouchEnd);
}

window.onclick = function(event) {
    const target = event.target;
    if (!target?.classList?.contains?.('modal')) return;
    const modalId = String(target.id || '').trim();
    if (!modalId) return;
    if (window.innerWidth > 768) {
        const blockOutsideClose = [
            'editProfileModal',
            'editListingModal',
            'changePasswordModal',
            'identityVerificationModal',
            'verifiedCodModal',
            'codModal',
            'vipModal',
            'verifiedUpgradeModal',
            'loginModal',
            'registerModal'
        ];
        if (blockOutsideClose.includes(modalId)) return;
    }
    closeModal(modalId);
};

let scrollTopBtnEl = null;
let scrollRafPending = false;
try {
    scrollTopBtnEl = document.getElementById('scrollTopBtn');
} catch (e) {
    scrollTopBtnEl = null;
}

window.addEventListener('scroll', () => {
    if (scrollRafPending) return;
    scrollRafPending = true;
    requestAnimationFrame(() => {
        scrollRafPending = false;
        if (!scrollTopBtnEl) {
            try {
                scrollTopBtnEl = document.getElementById('scrollTopBtn');
            } catch (e) {
                scrollTopBtnEl = null;
            }
        }
        if (!scrollTopBtnEl) return;
        if (window.scrollY > 500) scrollTopBtnEl.classList.add('visible');
        else scrollTopBtnEl.classList.remove('visible');
    });
}, { passive: true });

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

let selectedVipPlan = null;
let selectedVerifiedPlan = null;
let vipSelectedOffer = 'pro';
let verifiedSelectedOffer = 'pro';
let vipBilling = 'monthly';
let verifiedBilling = 'monthly';

function formatDzd(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return String(value ?? '');
    try {
        return n.toLocaleString('en-US');
    } catch (e) {
        return String(n);
    }
}

function billingLabel(billing) {
    return String(billing) === 'yearly' ? 'Annuel' : 'Mensuel';
}

function billingUnit(billing) {
    return String(billing) === 'yearly' ? 'DZD/an' : 'DZD/mois';
}

const VIP_PRICES = {
    monthly: { basic: 900, pro: 1500, pro_plus: 2500 },
    yearly: { basic: 6500, pro: 10800, pro_plus: 18000 }
};

const VERIFIED_PRICES = {
    monthly: { basic: 600, pro: 900, pro_plus: 1400 },
    yearly: { basic: 5000, pro: 7500, pro_plus: 11600 }
};

function getTierLabel(tier) {
    const t = String(tier || '').trim();
    if (t === 'pro_plus') return 'Pro+';
    if (t === 'pro') return 'Pro';
    return 'Basic';
}

function applyBillingToggleUI(prefix, billing) {
    const monthlyBtn = document.getElementById(`${prefix}BillingMonthlyBtn`);
    const yearlyBtn = document.getElementById(`${prefix}BillingYearlyBtn`);
    const isYearly = String(billing) === 'yearly';
    if (monthlyBtn) monthlyBtn.classList.toggle('active', !isYearly);
    if (yearlyBtn) yearlyBtn.classList.toggle('active', !!isYearly);
}

function applyTierPricesUI(prefix, billing, prices) {
    const b = String(billing) === 'yearly' ? 'yearly' : 'monthly';
    const unit = billingUnit(b);
    const tierMap = [
        { tier: 'basic', priceId: `${prefix}PriceBasic`, unitId: `${prefix}UnitBasic` },
        { tier: 'pro', priceId: `${prefix}PricePro`, unitId: `${prefix}UnitPro` },
        { tier: 'pro_plus', priceId: `${prefix}PriceProPlus`, unitId: `${prefix}UnitProPlus` }
    ];
    tierMap.forEach((x) => {
        const priceEl = document.getElementById(x.priceId);
        const unitEl = document.getElementById(x.unitId);
        if (priceEl) priceEl.textContent = formatDzd(prices?.[b]?.[x.tier]);
        if (unitEl) unitEl.textContent = unit;
    });
}

function setVipBilling(nextBilling) {
    vipBilling = String(nextBilling) === 'yearly' ? 'yearly' : 'monthly';
    applyBillingToggleUI('vip', vipBilling);
    applyTierPricesUI('vip', vipBilling, VIP_PRICES);
}

function setVerifiedBilling(nextBilling) {
    verifiedBilling = String(nextBilling) === 'yearly' ? 'yearly' : 'monthly';
    applyBillingToggleUI('verified', verifiedBilling);
    applyTierPricesUI('verified', verifiedBilling, VERIFIED_PRICES);
}

function openVipCodModalForSelection(offer, billing) {
    vipSelectedOffer = String(offer) || 'pro';
    vipBilling = String(billing) === 'yearly' ? 'yearly' : 'monthly';
    selectedVipPlan = `${vipSelectedOffer}_${vipBilling}`;
    closeModal('vipModal');

    const tier = getTierLabel(vipSelectedOffer);
    const planLabel = `${tier} • ${billingLabel(vipBilling)}`;
    const amount = VIP_PRICES?.[vipBilling]?.[vipSelectedOffer];
    const priceLabel = `${formatDzd(amount)} ${billingUnit(vipBilling)}`;

    const planEl = document.getElementById('codPlanName');
    const priceEl = document.getElementById('codPrice');
    if (planEl) planEl.textContent = planLabel;
    if (priceEl) priceEl.textContent = priceLabel;

    populateWilayasSelect('codWilaya');
    openModal('codModal');
    scheduleLucideCreateIcons(document.getElementById('codModal'));
}

function openVerifiedCodModalForSelection(offer, billing) {
    verifiedSelectedOffer = String(offer) || 'pro';
    verifiedBilling = String(billing) === 'yearly' ? 'yearly' : 'monthly';
    selectedVerifiedPlan = `${verifiedSelectedOffer}_${verifiedBilling}`;
    closeModal('verifiedUpgradeModal');

    const tier = getTierLabel(verifiedSelectedOffer);
    const planLabel = `${tier} • ${billingLabel(verifiedBilling)}`;
    const amount = VERIFIED_PRICES?.[verifiedBilling]?.[verifiedSelectedOffer];
    const priceLabel = `${formatDzd(amount)} ${billingUnit(verifiedBilling)}`;

    const planEl = document.getElementById('verifiedPlanName');
    const priceEl = document.getElementById('verifiedPrice');
    if (planEl) planEl.textContent = planLabel;
    if (priceEl) priceEl.textContent = priceLabel;

    populateWilayasSelect('verifiedWilaya');
    openModal('verifiedCodModal');
    scheduleLucideCreateIcons(document.getElementById('verifiedCodModal'));
}

function openVipModal() {
    if (userProfile?.isVip) {
        showToast('You are already VIP', 'check-circle');
        updateUpgradeOfferVisibility();
        return;
    }
    openModal('vipModal');
    setVipBilling(vipBilling);
    scheduleLucideCreateIcons(document.getElementById('vipModal'));
}

function openVerifiedUpgradeModal() {
    if (userProfile?.verified) {
        showToast('You are already Verified', 'check-circle');
        updateUpgradeOfferVisibility();
        return;
    }
    openModal('verifiedUpgradeModal');
    setVerifiedBilling(verifiedBilling);
    scheduleLucideCreateIcons(document.getElementById('verifiedUpgradeModal'));
}

function selectVipOffer(offer) {
    openVipCodModalForSelection(offer, vipBilling);
}

function populateWilayasSelect(selectId) {
    const select = document.getElementById(selectId);
    select.innerHTML = '<option value="">Sélectionner...</option>';
    wilayas.forEach(w => {
        const parts = w.split(' ');
        const code = parts.shift() || '';
        const name = parts.join(' ');
        select.innerHTML += `<option value="${code}">${code} - ${name}</option>`;
    });
}

async function submitVipSubscription() {
    const phone = document.getElementById('codPhone').value.trim();
    const wilaya = document.getElementById('codWilaya').value;
    if (!phone || !wilaya) {
        showToast('Veuillez remplir tous les champs', 'alert-circle');
        return;
    }
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    const { data: userData, error: userErr } = await client.auth.getUser();
    const userId = userData?.user?.id || null;
    if (userErr || !userId) {
        showToast('Please log in again', 'log-in');
        openModal('loginModal');
        return;
    }
    const desiredPlan = selectedVipPlan || `${vipSelectedOffer}_${vipBilling}`;
    const fallbackPlan = vipBilling || 'monthly';
    const payload = { user_id: userId, plan: desiredPlan, phone, wilaya, status: 'pending' };
    let { error } = await client.from('vip_applications').insert(payload);
    if (error && desiredPlan !== fallbackPlan) {
        const retryPayload = { ...payload, plan: fallbackPlan };
        const retry = await client.from('vip_applications').insert(retryPayload);
        error = retry.error || null;
    }
    if (error) {
        showToast(error.message || 'Failed to submit', 'alert-circle');
        return;
    }
    closeModal('codModal');
    showToast('Abonnement VIP confirmé ! Un agent vous contactera.', 'check-circle');
}

function selectVerifiedOffer(offer) {
    openVerifiedCodModalForSelection(offer, verifiedBilling);
}

async function submitVerifiedSubscription() {
    const phone = document.getElementById('verifiedPhone').value.trim();
    const wilaya = document.getElementById('verifiedWilaya').value;
    if (!phone || !wilaya) {
        showToast('Veuillez remplir tous les champs', 'alert-circle');
        return;
    }
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    const { data: userData, error: userErr } = await client.auth.getUser();
    const userId = userData?.user?.id || null;
    if (userErr || !userId) {
        showToast('Please log in again', 'log-in');
        openModal('loginModal');
        return;
    }
    const desiredPlan = selectedVerifiedPlan || `${verifiedSelectedOffer}_${verifiedBilling}`;
    const fallbackPlan = verifiedBilling || 'monthly';
    const payload = { user_id: userId, plan: desiredPlan, phone, wilaya, status: 'pending' };
    let { error } = await client.from('verified_applications').insert(payload);
    if (error && desiredPlan !== fallbackPlan) {
        const retryPayload = { ...payload, plan: fallbackPlan };
        const retry = await client.from('verified_applications').insert(retryPayload);
        error = retry.error || null;
    }
    if (error) {
        showToast(error.message || 'Failed to submit', 'alert-circle');
        return;
    }
    closeModal('verifiedCodModal');
    showToast('Demande Vérifié envoyée ! Un agent vous contactera.', 'check-circle');
}

function submitReport() {
    const reason = document.querySelector('input[name="reportReason"]:checked');
    if (!reason) {
        showToast('Veuillez sélectionner une raison', 'alert-circle');
        return;
    }
    closeModal('reportModal');
    showToast('Signalement envoyé. Merci de votre aide.', 'flag');
}

function openBlockModal() {
    openModal('blockModal');
}

function blockUser() {
    closeModal('blockModal');
    showToast('Utilisateur bloqué', 'ban');
}

function reportUser() {
    closeModal('reportModal');
    showToast('Signalement envoyé. Merci de votre aide.', 'flag');
}

let createListingStepBound = false;

function setCreateListingStep(step = 'details') {
    const next = String(step || '').trim() || 'details';
    createListingStep = next;
    const section = document.getElementById('create-listing-section');
    if (!section) return;
    const form = document.getElementById('addListingForm');
    if (!form) return;
    const groups = Array.from(form.querySelectorAll('.form-group'));
    const catGroup = document.getElementById('listingCategory')?.closest?.('.form-group') || null;
    const subGroup = document.getElementById('listingSubcategory')?.closest?.('.form-group') || null;
    const continueBtn = document.getElementById('createListingContinueBtn');
    const changeBtn = document.getElementById('createListingChangeCategoryBtn');
    const submitBtn = form.querySelector('button[type="submit"]');
    const header = section.querySelector('.page-card-head h2');
    const subtitle = section.querySelector('.page-card-head .muted');

    groups.forEach((g) => g.classList.remove('create-listing-step-hidden'));

    const isCategoryStep = createListingMode === 'create' && next === 'category';
    if (isCategoryStep) {
        groups.forEach((g) => {
            if (g === catGroup || g === subGroup) return;
            g.classList.add('create-listing-step-hidden');
        });
        if (continueBtn) continueBtn.style.display = 'inline-flex';
        if (changeBtn) changeBtn.style.display = 'none';
        if (submitBtn) submitBtn.style.display = 'none';
        if (header) {
            if (!header.dataset.defaultText) header.dataset.defaultText = header.textContent || '';
            header.textContent = 'Choisir une catégorie';
        }
        if (subtitle) {
            if (!subtitle.dataset.defaultText) subtitle.dataset.defaultText = subtitle.textContent || '';
            subtitle.textContent = 'Sélectionnez une catégorie pour charger le bon formulaire';
        }
        try {
            const priceType = document.getElementById('listingPriceType');
            const priceEl = document.getElementById('listingPrice');
            if (priceType && priceEl) {
                priceEl.disabled = priceType.value === 'Free';
            }
        } catch (e) {
            null;
        }
        try {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (e) {
            null;
        }
        return;
    }

    if (createListingMode === 'create' && next === 'details') {
        if (catGroup) catGroup.classList.add('create-listing-step-hidden');
        if (subGroup) subGroup.classList.add('create-listing-step-hidden');
    }

    if (continueBtn) continueBtn.style.display = 'none';
    if (changeBtn) changeBtn.style.display = 'none';
    if (submitBtn) submitBtn.style.display = '';
    if (header && header.dataset.defaultText && createListingMode === 'create') header.textContent = header.dataset.defaultText;
    if (subtitle && subtitle.dataset.defaultText && createListingMode === 'create') subtitle.textContent = subtitle.dataset.defaultText;
    try {
        renderListingDynamicFields();
    } catch (e) {
        null;
    }
}

function bindCreateListingStepFlow() {
    if (createListingStepBound) return;
    createListingStepBound = true;

    const continueBtn = document.getElementById('createListingContinueBtn');
    const changeBtn = document.getElementById('createListingChangeCategoryBtn');
    const categoryEl = document.getElementById('listingCategory');
    const subcategoryEl = document.getElementById('listingSubcategory');

    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            if (!requireAuthOrPrompt()) return;
            if (!categoryEl || !String(categoryEl.value || '').trim()) {
                showToast('Choisissez une catégorie', 'alert-circle');
                try {
                    openCategoryPicker('listingCategory');
                } catch (e) {
                    null;
                }
                return;
            }
            if (!subcategoryEl || !String(subcategoryEl.value || '').trim()) {
                showToast('Choisissez une sous-catégorie', 'alert-circle');
                try {
                    refreshSelectPicker(subcategoryEl);
                    subcategoryEl.focus?.();
                } catch (e) {
                    null;
                }
                return;
            }
            try {
                renderListingDynamicFields({});
            } catch (e) {
                null;
            }
            setCreateListingStep('details');
            try {
                const titleEl = document.getElementById('listingTitle');
                setTimeout(() => titleEl?.focus?.(), 50);
            } catch (e) {
                null;
            }
        });
    }

    if (changeBtn) changeBtn.style.display = 'none';
}

//#region debug-point vip-video-upload-failed
const DEBUG_VIP_VIDEO_UPLOAD_SESSION_ID = 'vip-video-upload-failed';
const DEBUG_VIP_VIDEO_UPLOAD_RUN_ID = 'pre';
const DEBUG_VIP_VIDEO_UPLOAD_DEFAULT_SERVER_URL = 'http://127.0.0.1:7778/event';

function getVipVideoUploadDebugServerUrl() {
    try {
        const override = localStorage.getItem('winjayDebugServerUrl') || '';
        if (override && /^https?:\/\//i.test(override)) return override;
    } catch (e) {
        null;
    }
    return DEBUG_VIP_VIDEO_UPLOAD_DEFAULT_SERVER_URL;
}

function debugVipVideoUploadEnabled() {
    try {
        if (localStorage.getItem('winjayDebugVipVideoUpload') === '1') return true;
        const hasOverride = localStorage.getItem('winjayDebugServerUrl') || '';
        if (hasOverride) return true;
    } catch (e) {
        null;
    }
    return location.protocol === 'file:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
}

async function reportVipVideoUploadDebugEvent(eventName, data) {
    if (!debugVipVideoUploadEnabled()) return;
    try {
        await fetch(getVipVideoUploadDebugServerUrl(), {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
                sessionId: DEBUG_VIP_VIDEO_UPLOAD_SESSION_ID,
                runId: DEBUG_VIP_VIDEO_UPLOAD_RUN_ID,
                pointId: 'vip-video-upload',
                eventName,
                data: data || {}
            })
        });
    } catch (e) {
        null;
    }
}
//#endregion debug-point vip-video-upload-failed

async function requestVipListingVideoSignedUpload({ listingId, filename, contentType } = {}) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase non configuré' };
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData?.session?.access_token || '';
    if (!token) return { error: 'Session expirée. Reconnectez-vous.' };
    const safeListingId = Number(listingId) || 0;
    if (!safeListingId) return { error: 'Annonce invalide' };
    reportVipVideoUploadDebugEvent('signed_upload_request_start', {
        listingId: safeListingId,
        hasToken: !!token,
        url: `${SUPABASE_PROJECT_URL}/functions/v1/vip-listing-video-upload`,
        contentType: String(contentType || 'video/mp4'),
        filename: String(filename || '')
    });
    try {
        const res = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/vip-listing-video-upload`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                apikey: SUPABASE_ANON_KEY,
                authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                listingId: safeListingId,
                filename: safeStorageFilename(filename || 'video.mp4'),
                contentType: String(contentType || 'video/mp4')
            })
        });
        const raw = await res.text();
        reportVipVideoUploadDebugEvent('signed_upload_request_response', {
            listingId: safeListingId,
            status: res.status,
            ok: res.ok,
            contentType: res.headers?.get?.('content-type') || '',
            bodyPreview: String(raw || '').slice(0, 500)
        });
        let payload = null;
        try {
            payload = raw ? JSON.parse(raw) : null;
        } catch (e) {
            payload = null;
        }
        if (!res.ok) {
            if (res.status === 404) {
                return { error: "Fonction vidéo introuvable. Déployez 'vip-listing-video-upload' sur Supabase." };
            }
            return { error: payload?.error || raw || `Requête d'upload vidéo échouée (${res.status})` };
        }
        if (!payload || !payload.signedUrl || !payload.path) {
            return { error: "Réponse d'upload invalide" };
        }
        return payload;
    } catch (e) {
        reportVipVideoUploadDebugEvent('signed_upload_request_error', {
            listingId: safeListingId,
            name: String(e?.name || ''),
            message: String(e?.message || e || '')
        });
        return { error: "Requête d'upload vidéo échouée" };
    }
}

async function uploadVipListingVideoToStorage({ listingId, file, signed } = {}) {
    const f = file || null;
    if (!f) return null;
    if (listingVideoUploadActive && !signed) return { error: 'Upload déjà en cours' };
    listingVideoUploadActive = true;
    setListingSubmitVideoUploadState(true);
    setListingVideoUploadOverlay({ visible: true, percent: 0, loaded: 0, total: Number(f.size) || 0 });
    const cancelBtn = document.getElementById('listingVideoUploadCancelBtn');
    if (cancelBtn) cancelBtn.disabled = false;

    let canceled = false;
    listingVideoUploadCancelHandler = () => {
        canceled = true;
        try { listingVideoUploadXhr?.abort?.(); } catch (e) { null; }
        clearListingVideoUploadState();
    };

    const signedPayload =
        signed && typeof signed === 'object'
            ? signed
            : await requestVipListingVideoSignedUpload({
                  listingId,
                  filename: f.name || 'video.mp4',
                  contentType: f.type || 'video/mp4'
              });
    if (canceled) return { error: 'Upload annulé' };
    if (!signedPayload?.signedUrl || !signedPayload?.path) {
        clearListingVideoUploadState();
        return { error: signedPayload?.error || 'Signed upload URL missing' };
    }
    reportVipVideoUploadDebugEvent('signed_put_start', {
        listingId: Number(listingId) || 0,
        path: String(signedPayload.path || ''),
        urlHost: (() => {
            try { return new URL(String(signedPayload.signedUrl)).host; } catch (e) { return ''; }
        })(),
        size: Number(f.size) || 0,
        type: String(f.type || '')
    });

    const result = await new Promise((resolve) => {
        let finished = false;
        const done = (payload) => {
            if (finished) return;
            finished = true;
            clearListingVideoUploadState();
            resolve(payload);
        };

        const xhr = new XMLHttpRequest();
        listingVideoUploadXhr = xhr;

        xhr.upload.onprogress = (ev) => {
            const total = Number(ev?.total) || Number(f.size) || 0;
            const loaded = Number(ev?.loaded) || 0;
            const pct = total > 0 ? (loaded / total) * 100 : 0;
            setListingVideoUploadOverlay({ visible: true, percent: pct, loaded, total });
        };

        xhr.onerror = () => {
            reportVipVideoUploadDebugEvent('signed_put_error', {
                listingId: Number(listingId) || 0,
                name: 'xhr-error',
                message: 'network'
            });
            done({ error: 'Upload vidéo échoué (réseau)' });
        };

        xhr.onabort = () => {
            done({ error: 'Upload annulé' });
        };

        xhr.onload = () => {
            const ok = xhr.status >= 200 && xhr.status < 300;
            const raw = String(xhr.responseText || '');
            reportVipVideoUploadDebugEvent('signed_put_response', {
                listingId: Number(listingId) || 0,
                ok,
                status: xhr.status || null,
                bodyPreview: raw.slice(0, 500)
            });
            if (!ok) {
                done({ error: raw || `Upload vidéo échoué (${xhr.status})` });
                return;
            }
            setListingVideoUploadOverlay({ visible: true, percent: 100, loaded: Number(f.size) || 0, total: Number(f.size) || 0 });
            const videoUrl = String(signedPayload.publicUrl || '').trim();
            done({
                video_path: String(signedPayload.path || '').trim(),
                video_url: videoUrl
            });
        };

        try {
            xhr.open('PUT', String(signedPayload.signedUrl), true);
            xhr.setRequestHeader('content-type', String(f.type || 'video/mp4'));
            xhr.send(f);
        } catch (e) {
            reportVipVideoUploadDebugEvent('signed_put_error', {
                listingId: Number(listingId) || 0,
                name: String(e?.name || ''),
                message: String(e?.message || e || '')
            });
            done({ error: 'Upload vidéo échoué' });
        }
    });

    return result;
}

document.getElementById('addListingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!requireAuthOrPrompt()) return;
    if (createListingMode === 'create' && createListingStep === 'category') {
        showToast('Choisissez une catégorie', 'alert-circle');
        return;
    }
    if (isAutoGeneratedTag(userProfile?.tag)) {
        showToast('Set your username before posting listings', 'alert-circle');
        openModal('editProfileModal');
        return;
    }
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    const submitBtn = e.target?.querySelector?.('button[type="submit"]') || null;
    const originalBtnText = submitBtn?.textContent || '';
    const isEditMode = createListingMode === 'edit' && Number(editingListingId) > 0;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEditMode ? 'Saving...' : 'Posting...';
    }

    const withTimeout = (promise, ms, label) => {
        let timeoutId;
        const timeout = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error(label)), ms);
        });
        return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId));
    };

    let watchdogFired = false;
    const watchdogId = setTimeout(() => {
        watchdogFired = true;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText || 'Publish listing';
        }
        showToast('Request taking too long. Check your internet and try again.', 'alert-circle');
    }, 20000);

    try {
        if (listingVideoUploadActive) {
            showToast('Upload vidéo en cours…', 'loader');
            return;
        }
        const wantsVideo = !!selectedListingVideoObjectUrl;
        if (wantsVideo && !listingVideoTmpMeta?.path) {
            showToast('Vidéo non uploadée. Réessayez ou retirez la vidéo.', 'alert-circle');
            return;
        }
        const { data: userData, error: userErr } = await withTimeout(
            client.auth.getUser(),
            12000,
            'Login check timed out'
        );
        const userId = userData?.user?.id || null;
        if (userErr || !userId) {
            showToast('Please log in again', 'log-in');
            openModal('loginModal');
            return;
        }

        const ensuredProfile = await ensureSupabaseProfileRow(client, userData.user);
        if (!ensuredProfile) {
            showToast('Your account profile is missing. Please log out and log in again.', 'alert-circle');
            return;
        }
        const isPrivilegedAccount =
            !!(ensuredProfile?.is_vip ?? ensuredProfile?.vip ?? userProfile?.isVip) ||
            !!(ensuredProfile?.verified ?? ensuredProfile?.is_verified ?? userProfile?.verified);
        const isVipAccount = !!(ensuredProfile?.is_vip ?? ensuredProfile?.vip ?? userProfile?.isVip);
        const existingListing = isEditMode ? listings.find((l) => l && l.id === Number(editingListingId)) : null;

        const title = document.getElementById('listingTitle').value.trim();
        const description = document.getElementById('listingDescription')?.value?.trim?.() || '';
        const category = document.getElementById('listingCategory').value;
        const subcategory = document.getElementById('listingSubcategory')?.value || '';
        const normalizedCategory = normalizeListingCategory(category, subcategory);
        const isHotelListing = normalizedCategory === 'Hébergement';
        const isJobListing = normalizedCategory === 'Emploi';
        let condition = document.getElementById('listingCondition')?.value || '';
        let priceType = document.getElementById('listingPriceType')?.value || '';
        let price = Number(document.getElementById('listingPrice').value) || 0;
        const wilaya = document.getElementById('listingWilaya').value;
        const city = document.getElementById('listingCity')?.value || '';
        let delivery = document.getElementById('listingDelivery')?.value || '';
        const contactPhone = document.getElementById('listingContactPhone')?.value?.trim?.() || '';
        let availability = document.getElementById('listingAvailability')?.value || 'Available';
        const tagsRaw = document.getElementById('listingTags')?.value || '';
        const tags = Array.from(
            new Map(
                tagsRaw
                    .split(',')
                    .map((t) => String(t || '').trim())
                    .filter(Boolean)
                    .map((t) => [t.toLowerCase(), t])
            ).values()
        ).slice(0, 5);
        const imagePlan = Array.from({ length: MAX_LISTING_IMAGES }, (_, i) => {
            const url = selectedListingImageUrls[i];
            if (!url) return null;
            const file = selectedListingImages[i];
            if (file) return { kind: 'new', file };
            return { kind: 'existing', url };
        }).filter(Boolean);
        const files = imagePlan.filter((x) => x.kind === 'new').map((x) => x.file);
        const detailsRaw = validateListingDynamicFields();
        if (detailsRaw === null) return;
        const baseDetails = existingListing?.details && typeof existingListing.details === 'object' ? existingListing.details : {};
        let mergedDetails = { ...(baseDetails || {}), ...(detailsRaw || {}) };
        let details = Object.keys(mergedDetails).length ? mergedDetails : null;

        if (isHotelListing) {
            condition = 'New';
            priceType = 'Fixed';
            delivery = 'Pickup only';
            availability = 'Available';
            if (priceType !== 'Free' && price <= 0) {
                const minPrice = getHotelMinRoomPriceFromForm();
                if (!minPrice || minPrice <= 0) {
                    showToast('Add at least 1 room with a nightly price', 'alert-circle');
                    return;
                }
                price = minPrice;
                const priceEl = document.getElementById('listingPrice');
                if (priceEl) priceEl.value = String(price);
            }
            const hotelData = collectHotelData();
            if (hotelData) {
                mergedDetails = { ...(mergedDetails || {}), hotel: hotelData };
                details = Object.keys(mergedDetails).length ? mergedDetails : null;
            }
        }

        if (isJobListing) {
            condition = 'New';
            priceType = 'Free';
            price = 0;
            delivery = 'Pickup only';
            availability = 'Available';
            const priceEl = document.getElementById('listingPrice');
            if (priceEl) priceEl.value = '0';
            const priceTypeEl = document.getElementById('listingPriceType');
            if (priceTypeEl) priceTypeEl.value = 'Free';
        }

        if (!title) {
            showToast('Title is required', 'alert-circle');
            return;
        }
        if (!condition) {
            showToast('Condition is required', 'alert-circle');
            return;
        }
        if (!priceType) {
            showToast('Price type is required', 'alert-circle');
            return;
        }
        if (priceType !== 'Free' && price <= 0) {
            showToast('Price is required', 'alert-circle');
            return;
        }
        if (!category) {
            showToast('Category is required', 'alert-circle');
            return;
        }
        if (!subcategory && Array.isArray(listingSubcategoriesByCategory[category]) && listingSubcategoriesByCategory[category].length) {
            showToast('Subcategory is required', 'alert-circle');
            return;
        }
        if (!wilaya) {
            showToast('Wilaya is required', 'alert-circle');
            return;
        }
        if (!city) {
            showToast('City / Commune is required', 'alert-circle');
            return;
        }
        if (!delivery) {
            showToast('Delivery is required', 'alert-circle');
            return;
        }
        if (!contactPhone) {
            showToast('Phone number is required', 'alert-circle');
            return;
        }
        if (imagePlan.length === 0) {
            showToast('Please add at least 1 photo', 'alert-circle');
            return;
        }

        if (!isEditMode && !isPrivilegedAccount) {
            const { data: existingUserListings, error: limitErr } = await withTimeout(
                client.from('listings').select('id').eq('owner_id', userId).is('deleted_at', null).limit(FREE_LISTING_LIMIT + 1),
                12000,
                'Listing limit check timed out'
            );
            if (limitErr) {
                showToast(limitErr.message || 'Failed to check listing limit', 'alert-circle');
                return;
            }
            if ((existingUserListings || []).length >= FREE_LISTING_LIMIT) {
                openListingLimitModal(FREE_LISTING_LIMIT);
                return;
            }
        }

        if (isEditMode) {
            const listingId = Number(editingListingId);
            const objectPaths = [];
            const finalUrls = [];
            const finalThumbUrls = [];
            const existingThumbByUrl = new Map(
                (existingListing?.listing_images_meta || [])
                    .map((x) => [String(x?.url || ''), String(x?.thumbnail_url || '')])
                    .filter((pair) => pair[0])
            );
            for (let i = 0; i < imagePlan.length; i++) {
                const entry = imagePlan[i];
                if (entry.kind === 'existing') {
                    finalUrls.push(entry.url);
                    finalThumbUrls.push(existingThumbByUrl.get(entry.url) || '');
                    continue;
                }
                const f = entry.file;
                const safeName = String(f.name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_');
                const objectPath = `${userId}/${listingId}/${Date.now()}_${i + 1}_${safeName}`;
                objectPaths.push(objectPath);
                const thumbBlob = await createListingThumbnailBlob(f);
                let thumbPath = '';
                if (thumbBlob) {
                    const ext = String(thumbBlob.type || '').includes('webp') ? 'webp' : 'jpg';
                    const base = safeName.replace(/\.[^.]+$/, '');
                    thumbPath = `${userId}/${listingId}/thumb_${Date.now()}_${i + 1}_${base}.${ext}`;
                    objectPaths.push(thumbPath);
                }
                const { error: uploadErr } = await withTimeout(
                    client.storage
                        .from(LISTING_IMAGES_BUCKET)
                        .upload(objectPath, f, { cacheControl: '3600', upsert: false, contentType: f.type || undefined }),
                    20000,
                    'Image upload timed out'
                );
                if (uploadErr) {
                    const msg = uploadErr?.message || 'Image upload failed';
                    showToast(msg.includes('row-level security') ? 'Storage: permission denied (RLS)' : msg, 'alert-circle');
                    return;
                }
                const { data: publicData } = client.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(objectPath);
                const publicUrl = publicData?.publicUrl || '';
                if (!publicUrl) {
                    showToast('Failed to generate image URL', 'alert-circle');
                    return;
                }
                finalUrls.push(publicUrl);
                let thumbUrl = '';
                if (thumbBlob && thumbPath) {
                    const { error: thumbErr } = await withTimeout(
                        client.storage
                            .from(LISTING_IMAGES_BUCKET)
                            .upload(thumbPath, thumbBlob, { cacheControl: '3600', upsert: false, contentType: thumbBlob.type || undefined }),
                        20000,
                        'Thumbnail upload timed out'
                    );
                    if (!thumbErr) {
                        const { data: thumbPublic } = client.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(thumbPath);
                        thumbUrl = thumbPublic?.publicUrl || '';
                    }
                }
                finalThumbUrls.push(thumbUrl || '');
            }
            if (isVipAccount && listingVideoTmpMeta?.path) {
                const attachRes = await requestVipListingVideoAttach({ listingId, tmpPath: listingVideoTmpMeta.path });
                if (!attachRes?.video_path) {
                    showToast(attachRes?.error || 'Upload vidéo échoué', 'alert-circle');
                    return;
                }
                const posterUrl = finalUrls[0] || existingListing?.image || '';
                mergedDetails = {
                    ...(mergedDetails || {}),
                    video_path: String(attachRes.video_path || ''),
                    video_url: String(attachRes.video_url || ''),
                    video_poster_url: posterUrl || null
                };
                details = Object.keys(mergedDetails).length ? mergedDetails : null;
                listingVideoTmpMeta = null;
            }
            const prevStatus = String(existingListing?.status || 'active');
            const shouldRestoreActive = prevStatus === 'active';
            const updatePayload = {
                title,
                description: description || null,
                condition: condition || null,
                price_type: priceType || null,
                subcategory: subcategory || null,
                price,
                delivery: delivery || null,
                availability: availability || null,
                category: category || null,
                wilaya: wilaya || null,
                city: city || null,
                contact_phone: contactPhone || null,
                tags: tags.length ? tags : null,
                details,
                ...(shouldRestoreActive ? { status: 'draft' } : {})
            };
            const { error: updateErr } = await withTimeout(
                client
                    .from('listings')
                    .update(updatePayload)
                    .eq('id', listingId)
                    .eq('owner_id', userId),
                15000,
                'Listing update timed out'
            );
            if (updateErr) {
                const msg = updateErr?.message || 'Failed to update listing';
                showToast(msg.includes('row-level security') ? 'Listings: permission denied (RLS)' : msg, 'alert-circle');
                return;
            }
            const imageRows = finalUrls.map((u, i) => ({
                listing_id: listingId,
                url: u,
                thumbnail_url: finalThumbUrls[i] || null,
                sort_order: i + 1
            }));
            const { error: delErr } = await withTimeout(
                client.from('listing_images').delete().eq('listing_id', listingId),
                15000,
                'Deleting images timed out'
            );
            if (delErr) {
                const msg = delErr?.message || 'Failed to update listing images';
                showToast(msg.includes('row-level security') ? 'Listing images: permission denied (RLS)' : msg, 'alert-circle');
                return;
            }
            const { error: imgErr } = await withTimeout(
                client.from('listing_images').insert(imageRows),
                15000,
                'Saving images timed out'
            );
            if (imgErr) {
                const msg = imgErr?.message || 'Failed to save listing images';
                showToast(msg.includes('row-level security') ? 'Listing images: permission denied (RLS)' : msg, 'alert-circle');
                return;
            }
            if (shouldRestoreActive) {
                const { error: restoreErr } = await withTimeout(
                    client.from('listings').update({ status: 'active' }).eq('id', listingId).eq('owner_id', userId),
                    12000,
                    'Activating listing timed out'
                );
                if (restoreErr) {
                    const msg = restoreErr?.message || 'Failed to activate listing';
                    showToast(msg.includes('row-level security') ? 'Listings: permission denied (RLS)' : msg, 'alert-circle');
                    return;
                }
            }
            showToast("Annonce mise à jour !", 'check-circle');
            editingListingId = null;
            listingVideoTmpMeta = null;
            createListingMode = 'create';
            setCreateListingPageMode('create');
            resetCreateListingDraft({ resetForm: true });
            await withTimeout(fetchListingsFromSupabase({ silent: true }), 12000, 'Refreshing listings timed out');
            openListingDetail(listingId);
            return;
        }

        const { data: inserted, error: insertErr } = await withTimeout(
            client
                .from('listings')
                .insert({
                    owner_id: userId,
                    title,
                    description: description || null,
                    condition: condition || null,
                    price_type: priceType || null,
                    subcategory: subcategory || null,
                    price,
                    delivery: delivery || null,
                    availability: availability || null,
                    category: category || null,
                    wilaya: wilaya || null,
                    city: city || null,
                    contact_phone: contactPhone || null,
                    tags: tags.length ? tags : null,
                    details,
                    status: 'draft'
                })
                .select('id')
                .single(),
            15000,
            'Listing creation timed out'
        );

        if (insertErr || !inserted?.id) {
            const msg = insertErr?.message || 'Failed to create listing';
            showToast(msg.includes('row-level security') ? 'Listings: permission denied (RLS)' : msg, 'alert-circle');
            return;
        }

        const listingId = Number(inserted.id);
        const objectPaths = [];
        const imageRows = [];
        for (let i = 0; i < files.length; i++) {
            const f = files[i];
            const safeName = String(f.name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_');
            const objectPath = `${userId}/${listingId}/${Date.now()}_${i + 1}_${safeName}`;
            objectPaths.push(objectPath);
            const thumbBlob = await createListingThumbnailBlob(f);
            let thumbPath = '';
            if (thumbBlob) {
                const ext = String(thumbBlob.type || '').includes('webp') ? 'webp' : 'jpg';
                const base = safeName.replace(/\.[^.]+$/, '');
                thumbPath = `${userId}/${listingId}/thumb_${Date.now()}_${i + 1}_${base}.${ext}`;
                objectPaths.push(thumbPath);
            }
            const { error: uploadErr } = await withTimeout(
                client.storage
                    .from(LISTING_IMAGES_BUCKET)
                    .upload(objectPath, f, { cacheControl: '3600', upsert: false, contentType: f.type || undefined }),
                20000,
                'Image upload timed out'
            );
            if (uploadErr) {
                try {
                    await client.storage.from(LISTING_IMAGES_BUCKET).remove(objectPaths);
                } catch (e) {
                    null;
                }
                await client.from('listing_images').delete().eq('listing_id', listingId);
                await client.from('listings').delete().eq('id', listingId).eq('owner_id', userId);
                const msg = uploadErr?.message || 'Image upload failed';
                showToast(msg.includes('row-level security') ? 'Storage: permission denied (RLS)' : msg, 'alert-circle');
                return;
            }
            const { data: publicData } = client.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(objectPath);
            const publicUrl = publicData?.publicUrl || '';
            if (!publicUrl) {
                showToast('Failed to generate image URL', 'alert-circle');
                return;
            }
            let thumbUrl = '';
            if (thumbBlob && thumbPath) {
                const { error: thumbErr } = await withTimeout(
                    client.storage
                        .from(LISTING_IMAGES_BUCKET)
                        .upload(thumbPath, thumbBlob, { cacheControl: '3600', upsert: false, contentType: thumbBlob.type || undefined }),
                    20000,
                    'Thumbnail upload timed out'
                );
                if (!thumbErr) {
                    const { data: thumbPublic } = client.storage.from(LISTING_IMAGES_BUCKET).getPublicUrl(thumbPath);
                    thumbUrl = thumbPublic?.publicUrl || '';
                }
            }
            imageRows.push({ listing_id: listingId, url: publicUrl, thumbnail_url: thumbUrl || null, sort_order: i + 1 });
        }

        const { error: imgErr } = await withTimeout(
            client.from('listing_images').insert(imageRows),
            15000,
            'Saving images timed out'
        );
        if (imgErr) {
            try { await client.storage.from(LISTING_IMAGES_BUCKET).remove(objectPaths); } catch (e) { null; }
            await client.from('listing_images').delete().eq('listing_id', listingId);
            await client.from('listings').delete().eq('id', listingId).eq('owner_id', userId);
            const msg = imgErr?.message || 'Failed to save listing images';
            showToast(msg.includes('row-level security') ? 'Listing images: permission denied (RLS)' : msg, 'alert-circle');
            return;
        }

        if (isVipAccount && listingVideoTmpMeta?.path) {
            const attachRes = await requestVipListingVideoAttach({ listingId, tmpPath: listingVideoTmpMeta.path });
            if (!attachRes?.video_path) {
                try { await client.storage.from(LISTING_IMAGES_BUCKET).remove(objectPaths); } catch (e) { null; }
                await client.from('listing_images').delete().eq('listing_id', listingId);
                await client.from('listings').delete().eq('id', listingId).eq('owner_id', userId);
                showToast(attachRes?.error || 'Upload vidéo échoué', 'alert-circle');
                return;
            }
            const posterUrl = imageRows[0]?.url || '';
            mergedDetails = {
                ...(mergedDetails || {}),
                video_path: String(attachRes.video_path || ''),
                video_url: String(attachRes.video_url || ''),
                video_poster_url: posterUrl || null
            };
            details = Object.keys(mergedDetails).length ? mergedDetails : null;
            const { error: videoSaveErr } = await withTimeout(
                client.from('listings').update({ details }).eq('id', listingId).eq('owner_id', userId),
                15000,
                'Saving video timed out'
            );
            if (videoSaveErr) {
                try { await client.storage.from(LISTING_IMAGES_BUCKET).remove(objectPaths); } catch (e) { null; }
                await client.from('listing_images').delete().eq('listing_id', listingId);
                await client.from('listings').delete().eq('id', listingId).eq('owner_id', userId);
                const msg = videoSaveErr?.message || 'Failed to save video';
                showToast(msg.includes('row-level security') ? 'Listings: permission denied (RLS)' : msg, 'alert-circle');
                return;
            }
            listingVideoTmpMeta = null;
        }

        const { error: activateErr } = await withTimeout(
            client.from('listings').update({ status: 'active' }).eq('id', listingId).eq('owner_id', userId),
            12000,
            'Activating listing timed out'
        );
        if (activateErr) {
            const msg = activateErr?.message || 'Failed to activate listing';
            showToast(msg.includes('row-level security') ? 'Listings: permission denied (RLS)' : msg, 'alert-circle');
            return;
        }

        showToast('Listing posted!', 'check-circle');
        resetCreateListingDraft({ resetForm: true });
        await withTimeout(fetchListingsFromSupabase({ silent: true }), 12000, 'Refreshing listings timed out');
        openListingDetail(listingId);
    } catch (err) {
        showToast(err?.message || 'Something went wrong', 'alert-circle');
    } finally {
        clearTimeout(watchdogId);
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText || 'Publish listing';
        }
    }
});

document.getElementById('editProfileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }

    const name = document.getElementById('editName').value.trim();
    let tagValue = document.getElementById('editTag').value.trim().toLowerCase().replace(/\s+/g, '');
    const oldTag = userProfile.tag;

    if (!tagValue) {
        showToast('Username is required', 'alert-circle');
        return;
    }

    if (/\s/.test(tagValue)) {
        showToast('Username cannot contain spaces', 'alert-circle');
        return;
    }

    if (!/^[a-z0-9_.]+$/.test(tagValue)) {
        showToast('Invalid username (letters, numbers, dots, underscores only)', 'alert-circle');
        return;
    }

    if (!tagValue.startsWith('@')) tagValue = '@' + tagValue;

    const { data: authData, error: authErr } = await client.auth.getUser();
    const user = authData?.user || null;
    if (authErr || !user?.id) {
        showToast('Please log in again', 'log-in');
        openModal('loginModal');
        return;
    }

    const location = document.getElementById('editLocation').value;
    const businessType = document.getElementById('editBusinessType').value;
    const phone = document.getElementById('editPhone')?.value?.trim() || '';
    const workCategoryId = businessType === 'Professionnel'
        ? (document.getElementById('editWorkCategory')?.value || '')
        : '';
    const workCategoryName = businessType === 'Professionnel'
        ? (document.getElementById('editWorkCategory')?.selectedOptions?.[0]?.textContent || '')
        : '';

    if (businessType === 'Professionnel' && !workCategoryId) {
        showToast('Work category is required', 'alert-circle');
        return;
    }

    const requestedIdentityKey = `${tagValue}|${businessType}|${workCategoryId}`;
    const currentIdentityKey = `${userProfile.tag}|${userProfile.businessType}|${userProfile.workCategoryId || ''}`;
    if (requestedIdentityKey !== currentIdentityKey && isProfileIdentityLocked()) {
        showToast('You can only change username/category once within 7 days', 'alert-circle');
        return;
    }

    const { data: existingProfile, error: existingErr } = await client
        .from('profiles')
        .select('id')
        .eq('tag', tagValue)
        .maybeSingle();
    if (existingErr) {
        showToast(existingErr.message || 'Failed to validate username', 'alert-circle');
        return;
    }
    if (existingProfile?.id && existingProfile.id !== user.id) {
        showToast('Username already taken', 'user-x');
        return;
    }

    if (tagValue !== oldTag) {
        try {
            const program = getFreeVerifiedProgramState();
            const oldCount = program.referrals[oldTag] || 0;
            if (oldCount) {
                program.referrals[tagValue] = (program.referrals[tagValue] || 0) + oldCount;
                delete program.referrals[oldTag];
                saveFreeVerifiedProgramState(program);
            }
        } catch (e) {
            null;
        }
    }

    const { error: upsertErr } = await client.from('profiles').upsert(
        {
            id: user.id,
            display_name: name,
            tag: tagValue,
            location,
            business_type: businessType,
            phone,
            work_category_id: businessType === 'Professionnel' ? workCategoryId : null,
            work_category: businessType === 'Professionnel' ? workCategoryName : ''
        },
        { onConflict: 'id' }
    );
    if (upsertErr) {
        showToast(upsertErr.message || 'Failed to save profile', 'alert-circle');
        return;
    }

    await client.auth.updateUser({ data: { full_name: name, tag: tagValue } });

    const { data: row } = await client.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (row) applySupabaseProfileRowToLocalState(row, user);

    closeModal('editProfileModal');
    showToast('Profile updated!', 'check-circle');
});

document.getElementById('contactForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('contactEmail')?.value?.trim() || '';
    const phone = document.getElementById('contactPhone')?.value?.trim() || '';
    const message = document.getElementById('contactMessage')?.value?.trim() || '';
    const client = initSupabase();
    if (client) {
        try {
            await client.from('submissions').insert({
                user_id: currentSupabaseUserId || null,
                type: 'contact',
                payload: { email, phone, message },
                status: 'pending'
            });
        } catch (e) {
            null;
        }
    }
    showToast('Message sent successfully!', 'send');
    closeModal('contactModal');
    e.target.reset();
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    try {
        const untilRaw = localStorage.getItem(LOGIN_COOLDOWN_UNTIL_STORAGE_KEY);
        const until = Number(untilRaw) || 0;
        const now = Date.now();
        if (until && now < until) {
            const seconds = Math.max(1, Math.ceil((until - now) / 1000));
            showToast(`Too many attempts. Wait ${seconds}s`, 'alert-circle');
            return;
        }
    } catch (e) {
        null;
    }
    const rememberMe = document.getElementById('rememberMe').checked;
    try {
        if (rememberMe) localStorage.setItem('winjayRememberMe', 'true');
        else localStorage.removeItem('winjayRememberMe');
    } catch (e) {
        null;
    }
    if (!rememberMe) clearSupabaseAuthTokenFromAllStorages();
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    client.auth.signInWithPassword({ email, password }).then(({ error }) => {
        if (error) {
            try {
                const raw = localStorage.getItem(LOGIN_FAIL_COUNT_STORAGE_KEY);
                const next = (Number(raw) || 0) + 1;
                if (next >= 5) {
                    localStorage.removeItem(LOGIN_FAIL_COUNT_STORAGE_KEY);
                    localStorage.setItem(LOGIN_COOLDOWN_UNTIL_STORAGE_KEY, String(Date.now() + 30_000));
                    showToast('Too many attempts. Please wait 30s.', 'alert-circle');
                    return;
                }
                localStorage.setItem(LOGIN_FAIL_COUNT_STORAGE_KEY, String(next));
            } catch (e) {
                null;
            }
            showToast(error.message || 'Login failed', 'alert-circle');
            return;
        }
        try {
            localStorage.removeItem(LOGIN_FAIL_COUNT_STORAGE_KEY);
            localStorage.removeItem(LOGIN_COOLDOWN_UNTIL_STORAGE_KEY);
        } catch (e) {
            null;
        }
        showToast('Logged in!', 'check-circle');
        closeModal('loginModal');
    });
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerPasswordConfirm').value;
    if (/\s/.test(password) || /\s/.test(confirm)) {
        showToast('Les espaces ne sont pas autorisés dans le mot de passe', 'alert-circle');
        return;
    }
    if (password !== confirm) {
        showToast('Les mots de passe ne correspondent pas', 'alert-circle');
        return;
    }
    const rawName = document.getElementById('registerName').value.trim();
    const safe = rawName.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 12) || 'user';
    const suffix = String(Math.floor(Math.random() * 900) + 100);
    const nextTag = `@${safe}${suffix}`;

    const email = document.getElementById('registerEmail').value.trim();
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    client.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: rawName || 'New user',
                tag: nextTag
            }
        }
    }).then(({ data, error }) => {
        if (error) {
            showToast(error.message || 'Sign up failed', 'alert-circle');
            return;
        }
        if (!data?.session) {
            showToast('Check your email to confirm your account', 'mail');
            closeModal('registerModal');
            e.target.reset();
            return;
        }
        userProfile.name = rawName || 'New user';
        userProfile.tag = nextTag;
        userProfile.verified = false;
        userProfile.isVip = false;
        userProfile.phone = '';
        userProfile.workCategory = '';
        userProfile.businessType = 'Particulier';
        userProfile.joinedDate = new Date().toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
        saveUserProfileToStorage();

        const referredBy = getPendingReferrerId() || getPendingReferrerTag();
        saveVerifiedQuestState({ identityStatus: 'none', identityVerified: false, granted: false, referredBy });

        showToast('Account created!', 'check-circle');
        closeModal('registerModal');
        e.target.reset();
        updateProfileUI();
        showSection('profile-section');
    });
});

document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const password = document.getElementById('changePasswordNew').value;
    const confirm = document.getElementById('changePasswordConfirm')?.value || '';
    if (/\s/.test(password) || /\s/.test(confirm)) {
        showToast('Les espaces ne sont pas autorisés dans le mot de passe', 'alert-circle');
        return;
    }
    if (!password) {
        showToast('Nouveau mot de passe requis', 'alert-circle');
        return;
    }
    if (confirm && password !== confirm) {
        showToast('Les mots de passe ne correspondent pas', 'alert-circle');
        return;
    }
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    client.auth.updateUser({ password }).then(({ error }) => {
        if (error) {
            showToast(error.message || 'Erreur', 'alert-circle');
            return;
        }
        showToast('Mot de passe mis à jour !', 'check-circle');
        closeModal('changePasswordModal');
        e.target.reset();
    });
});

function showToast(message, icon = 'info') {
    if (!toastContainer) {
        alert(String(message || ''));
        return;
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i data-lucide="${icon}"></i><span>${message}</span>`;
    toastContainer.appendChild(toast);
    scheduleLucideCreateIcons(toast);
    setTimeout(() => toast.classList.add('active'), 10);
    setTimeout(() => {
        toast.classList.remove('active');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function hasSupabaseAuthTokenLikely() {
    if (!SUPABASE_PROJECT_REF) return false;
    const key = `sb-${SUPABASE_PROJECT_REF}-auth-token`;
    try {
        if (localStorage.getItem(key)) return true;
    } catch (e) {
        null;
    }
    try {
        if (sessionStorage.getItem(key)) return true;
    } catch (e) {
        null;
    }
    return false;
}

function updateNavbarAuthUI() {
    const loggedIn = isLoggedIn();
    const verified = !!userProfile?.verified;
    const profileReady = loggedIn && hasLoadedSupabaseProfile;
    const likelyLoggedIn = loggedIn || hasSupabaseAuthTokenLikely();
    const loginBtn = document.getElementById('navLoginBtn');
    const notificationsBtn = document.getElementById('navNotificationsBtn');
    const messagesBtn = document.getElementById('navMessagesBtn');
    const addListingBtn = document.getElementById('navAddListingBtn');
    const freeVerifiedPill = document.getElementById('navFreeVerifiedPill');
    const profileMenu = document.getElementById('navProfileMenu');
    const sidebarCoursesItem = document.getElementById('sidebarCoursesItem');

    if (loginBtn) loginBtn.style.display = likelyLoggedIn ? 'none' : 'inline-flex';
    if (notificationsBtn) notificationsBtn.style.display = loggedIn ? '' : 'none';
    if (messagesBtn) messagesBtn.style.display = loggedIn ? '' : 'none';
    if (addListingBtn) addListingBtn.style.display = loggedIn ? '' : 'none';
    if (freeVerifiedPill) freeVerifiedPill.style.display = profileReady && !verified ? '' : 'none';
    if (profileMenu) profileMenu.style.display = loggedIn ? '' : 'none';
    if (sidebarCoursesItem) sidebarCoursesItem.style.display = loggedIn && isCoursesFeatureEnabledForViewer() ? '' : 'none';
    applyLiveSocialShoppingFeatureVisibility();
    updateLiveShoppingTrayUI();

    try {
        const showSkeleton = likelyLoggedIn && !profileReady;
        document.documentElement.classList.toggle('nav-avatar-loading', !!showSkeleton);
    } catch (e) {
        null;
    }
}

function updateProfileUI() {
    const skeleton = document.getElementById('myProfileSkeleton');
    const content = document.getElementById('myProfileContent');
    const ready = isLoggedIn() && hasLoadedSupabaseProfile;
    if (!ready) {
        if (skeleton) skeleton.style.display = '';
        if (content) content.style.display = 'none';
        updateNavbarAuthUI();
        applyCoursesFeatureVisibility();
        applyLiveSocialShoppingFeatureVisibility();
        return;
    }
    if (skeleton) skeleton.style.display = 'none';
    if (content) content.style.display = '';
    const nameEl = document.getElementById('profileName');
    nameEl.innerHTML = `${userProfile.name} ${getUserBadgesHTML(userProfile)}`;
    document.getElementById('profileTag').textContent = userProfile.tag;
    document.getElementById('profilePic').src = userProfile.profilePic;
    document.getElementById('navProfilePic').src = userProfile.profilePic;
    document.getElementById('profileCover').src = userProfile.coverPic;
    document.getElementById('profileLocation').textContent = userProfile.location;
    document.getElementById('profileBusiness').textContent = userProfile.businessType;
    const joinedEl = document.getElementById('profileJoined');
    if (joinedEl) joinedEl.textContent = userProfile.joinedDate || '—';
    const phoneText = userProfile.phone ? String(userProfile.phone) : '—';
    const phoneDisplay = document.getElementById('profilePhone');
    if (phoneDisplay) phoneDisplay.textContent = phoneText;
    let workText = userProfile.workCategory ? String(userProfile.workCategory) : '—';
    try {
        const id = userProfile?.workCategoryId ? String(userProfile.workCategoryId) : '';
        const row = id ? businessCategoriesById?.[id] : null;
        if (row) {
            workText = currentLang === 'ar'
                ? String(row.name_ar || row.name_en || row.name || workText)
                : (currentLang === 'en'
                    ? String(row.name_en || row.name || workText)
                    : String(row.name || workText));
        }
    } catch (e) {
        null;
    }
    const workDisplay = document.getElementById('profileWorkCategory');
    if (workDisplay) workDisplay.textContent = workText;
    document.getElementById('profileRatingContainer').innerHTML = getRatingHTML(userProfile.rating, userProfile.reviews);
    document.getElementById('editName').value = userProfile.name;
    document.getElementById('editTag').value = userProfile.tag.replace('@', '');
    document.getElementById('editLocation').value = userProfile.location;
    document.getElementById('editBusinessType').value = userProfile.businessType;
    const phoneEl = document.getElementById('editPhone');
    if (phoneEl) phoneEl.value = userProfile.phone || '';
    const workEl = document.getElementById('editWorkCategory');
    if (workEl) {
        workEl.value = userProfile.workCategoryId || '';
        if (!workEl.value && userProfile.workCategory) {
            const target = normalizeText(userProfile.workCategory);
            const match = Array.from(workEl.options || []).find((o) => normalizeText(o.textContent) === target);
            if (match) workEl.value = match.value;
        }
    }
    updateEditProfileWorkCategoryVisibility();
    const idLocked = isProfileIdentityLocked();
    const tagEl = document.getElementById('editTag');
    const typeEl = document.getElementById('editBusinessType');
    if (tagEl) tagEl.disabled = idLocked;
    if (typeEl) typeEl.disabled = idLocked;
    if (workEl) workEl.disabled = idLocked;
    if (typeEl) refreshSelectPicker(typeEl);
    if (workEl) refreshSelectPicker(workEl);
    updateFreeVerifiedCounterUI();
    renderVerifiedQuestCard();
    updateUpgradeOfferVisibility();
    updateFreeVerifiedPrimaryAction();
    updateAdminDashboardButtonVisibility();
    updateNavbarAuthUI();
    applyCoursesFeatureVisibility();
    applyLiveSocialShoppingFeatureVisibility();
    updateListingVideoGroupVisibility();
    scheduleLucideCreateIcons(document.getElementById('profile-section') || document.body);
    refreshMyProfileFollowCounts();
    refreshSidebarFollowing();
}

function isProfileIdentityLocked() {
    if (userProfile?.isAdmin) return false;
    const startedAt = userProfile?.identityInitializedAt ? new Date(userProfile.identityInitializedAt).getTime() : 0;
    if (!startedAt) return false;
    const ageMs = Date.now() - startedAt;
    const windowMs = 7 * 24 * 60 * 60 * 1000;
    if (ageMs > windowMs) return true;
    return (Number(userProfile?.identityChangeCount) || 0) >= 1;
}

async function refreshMyProfileFollowCounts() {
    if (!currentSupabaseUserId) return;
    const out = await fetchProfileFollowCountsByIds([currentSupabaseUserId]);
    const counts = out?.[currentSupabaseUserId] || { followers: 0, following: 0 };
    setProfileFollowCountUI({
        followersElId: 'profileFollowersCount',
        followingElId: 'profileFollowingCount',
        counts
    });
    scheduleLucideCreateIcons(document.getElementById('profile-section') || document.body);
}

function updateUpgradeOfferVisibility() {
    const vip = !!userProfile?.isVip;
    const verified = !!userProfile?.verified;
    const showFreeVerified = isLoggedIn() && hasLoadedSupabaseProfile && !verified;
    const profileReady = isLoggedIn() && hasLoadedSupabaseProfile;
    const likelyLoggedIn = isLoggedIn() || hasSupabaseAuthTokenLikely();

    const sidebarVerified = document.getElementById('sidebarVerifiedCta');
    if (sidebarVerified) sidebarVerified.style.display = likelyLoggedIn && !profileReady ? 'none' : verified ? 'none' : '';

    const sidebarVip = document.getElementById('sidebarVipCta');
    if (sidebarVip) sidebarVip.style.display = likelyLoggedIn && !profileReady ? 'none' : vip ? 'none' : '';

    const vipBadgeBtn = document.getElementById('vipBadgeBecomeBtn');
    if (vipBadgeBtn) vipBadgeBtn.style.display = vip ? 'none' : '';

    const verifiedBadgeBtn = document.getElementById('verifiedBadgeBecomeBtn');
    if (verifiedBadgeBtn) verifiedBadgeBtn.style.display = verified ? 'none' : '';

    const limitVipBtn = document.getElementById('listingLimitVipBtn');
    if (limitVipBtn) limitVipBtn.style.display = vip ? 'none' : '';

    const limitVerifiedBtn = document.getElementById('listingLimitVerifiedBtn');
    if (limitVerifiedBtn) limitVerifiedBtn.style.display = verified ? 'none' : '';

    document.querySelectorAll('.free-verified-pill').forEach((el) => {
        el.style.display = showFreeVerified ? '' : 'none';
    });
    updateMobileFooterBarState(showFreeVerified);

    const questCard = document.getElementById('verifiedQuestCard');
    if (questCard && verified) questCard.style.display = 'none';
}

function updateFreeVerifiedPrimaryAction() {
    const btn = document.getElementById('freeVerifiedPrimaryBtn');
    if (!btn) return;
    if (!isLoggedIn()) {
        btn.textContent = 'Create account';
        btn.onclick = () => {
            closeModal('freeVerifiedInfoModal');
            openModal('registerModal');
        };
        return;
    }
    btn.textContent = 'Apply';
    btn.onclick = () => {
        closeModal('freeVerifiedInfoModal');
        showSection('profile-section');
        setTimeout(() => {
            try {
                document.getElementById('verifiedQuestCard')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
            } catch (e) {
                null;
            }
        }, 200);
    };
}

function updateAdminDashboardButtonVisibility() {
    const btn = document.getElementById('adminDashboardDropdownItem');
    if (!btn) return;
    btn.style.display = userProfile?.isAdmin ? '' : 'none';
}

function formatLiveSocialShoppingMoney(value) {
    return `${new Intl.NumberFormat('fr-DZ').format(Number(value) || 0)} DZD`;
}

function getLiveSocialShoppingCardColor(item, index = 0) {
    const palette = ['#ffd7bf', '#dce8ff', '#ffe6ef', '#d9f5e6', '#fbe5c8', '#e5dcff'];
    if (item?.seller?.verified) return '#dfe8ff';
    if (item?.seller?.isVip) return '#ffe4bf';
    return palette[index % palette.length];
}

function getLiveSocialShoppingSourceListings() {
    const base = Array.isArray(listings) ? listings.slice() : [];
    return base
        .filter((item) => item && Number(item.id) > 0)
        .filter((item) => String(item.status || '').toLowerCase() === 'active')
        .filter((item) => String(item.availability || '').toLowerCase() !== 'sold')
        .filter((item) => Number(item.price) > 0)
        .filter((item) => !!(item.cardImage || item.image))
        .slice(0, 18);
}

function getLiveSocialShoppingCollections() {
    const source = getLiveSocialShoppingSourceListings();
    const featured = source.slice(0, 6);
    const premium = source.filter((item) => item?.seller?.verified || item?.seller?.isVip).slice(0, 6);
    const latest = source.slice(0, 9);
    return [
        {
            id: 'featured',
            label: 'Featured now',
            title: 'Trending products from real listings',
            subtitle: 'This live shopping view is powered by active marketplace listings already published on your website.',
            mood: 'Fast-moving catalog',
            accent: '#ff6a00',
            items: featured.length ? featured : latest
        },
        {
            id: 'premium',
            label: 'VIP & Verified',
            title: 'Trusted sellers in one shopping rail',
            subtitle: 'Premium stores with stronger seller signals and products ready to move.',
            mood: 'High trust',
            accent: '#4f7cff',
            items: premium.length ? premium : latest
        },
        {
            id: 'latest',
            label: 'Latest arrivals',
            title: 'Freshly published products',
            subtitle: 'Newest active listings that can be added to the tray immediately.',
            mood: 'Always updating',
            accent: '#22a06b',
            items: latest
        }
    ].filter((collection) => Array.isArray(collection.items) && collection.items.length);
}

function getLiveSocialShoppingCollectionById(collectionId) {
    const collections = getLiveSocialShoppingCollections();
    return collections.find((collection) => collection.id === collectionId) || collections[0] || null;
}

function getLiveSocialShoppingCartCatalog() {
    const map = new Map();
    getLiveSocialShoppingSourceListings().forEach((item, index) => {
        map.set(String(item.id), {
            productId: String(item.id),
            listingId: Number(item.id) || 0,
            title: item.title || 'Product',
            price: Number(item.price) || 0,
            sellerName: item?.seller?.name || 'Seller',
            sellerTag: item?.seller?.tag || '',
            image: item.cardImage || item.image || '',
            location: item.location || item.wilaya || '',
            delivery: item.delivery || '',
            badge: item?.seller?.verified ? 'Verified seller' : (item?.seller?.isVip ? 'VIP seller' : 'Marketplace pick'),
            color: getLiveSocialShoppingCardColor(item, index),
            seller: item?.seller || null,
            raw: item
        });
    });
    return map;
}

function getLiveSocialShoppingCartItems() {
    const catalog = getLiveSocialShoppingCartCatalog();
    return Object.entries(liveSocialShoppingState.cart || {})
        .map(([productId, quantity]) => {
            const product = catalog.get(String(productId));
            const qty = Number(quantity) || 0;
            if (!product || qty <= 0) return null;
            return {
                ...product,
                quantity: qty,
                subtotal: (Number(product.price) || 0) * qty
            };
        })
        .filter(Boolean);
}

function getLiveSocialShoppingCartTotal() {
    return getLiveSocialShoppingCartItems().reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
}

function persistLiveSocialShoppingTray() {
    try {
        localStorage.setItem(LIVE_SHOPPING_TRAY_STORAGE_KEY, JSON.stringify(liveSocialShoppingState.cart || {}));
    } catch (e) {
        null;
    }
}

function loadLiveSocialShoppingTray() {
    try {
        const raw = localStorage.getItem(LIVE_SHOPPING_TRAY_STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        if (parsed && typeof parsed === 'object') liveSocialShoppingState.cart = parsed;
    } catch (e) {
        liveSocialShoppingState.cart = {};
    }
}

function updateLiveShoppingTrayUI() {
    const trayBtn = document.getElementById('navTrayBtn');
    const badgeEl = document.getElementById('navTrayBadge');
    const totalEl = document.getElementById('navTrayTotal');
    if (!trayBtn || !badgeEl || !totalEl) return;
    const items = getLiveSocialShoppingCartItems();
    const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const total = getLiveSocialShoppingCartTotal();
    trayBtn.style.display = 'inline-flex';
    badgeEl.style.display = count > 0 ? '' : 'none';
    badgeEl.textContent = String(count);
    totalEl.textContent = count > 0 ? formatLiveSocialShoppingMoney(total) : 'Cart';
}

function setActiveLiveSocialShoppingCollection(collectionId) {
    const next = getLiveSocialShoppingCollectionById(collectionId);
    if (!next) return;
    liveSocialShoppingState.activeCollection = next.id;
    renderLiveSocialShoppingSection();
}

function addLiveSocialShoppingProduct(productId) {
    const key = String(productId || '').trim();
    if (!key) return;
    const catalog = getLiveSocialShoppingCartCatalog();
    if (!catalog.has(key)) {
        showToast('Product unavailable', 'alert-circle');
        return;
    }
    liveSocialShoppingState.cart[key] = (Number(liveSocialShoppingState.cart[key]) || 0) + 1;
    persistLiveSocialShoppingTray();
    updateLiveShoppingTrayUI();
    renderLiveSocialShoppingSection();
    renderLiveCheckoutSummary();
    showToast('Added to tray', 'shopping-bag');
}

function changeLiveSocialShoppingCartQuantity(productId, delta) {
    const key = String(productId || '').trim();
    if (!key) return;
    const next = (Number(liveSocialShoppingState.cart[key]) || 0) + (Number(delta) || 0);
    if (next <= 0) delete liveSocialShoppingState.cart[key];
    else liveSocialShoppingState.cart[key] = next;
    persistLiveSocialShoppingTray();
    updateLiveShoppingTrayUI();
    renderLiveSocialShoppingSection();
    renderLiveCheckoutSummary();
}

function removeLiveSocialShoppingProduct(productId) {
    const key = String(productId || '').trim();
    if (!key) return;
    delete liveSocialShoppingState.cart[key];
    persistLiveSocialShoppingTray();
    updateLiveShoppingTrayUI();
    renderLiveSocialShoppingSection();
    renderLiveCheckoutSummary();
}

function openLiveSocialShoppingAdmin() {
    navigateToSection('admin-dashboard-section');
}

function populateLiveCheckoutDefaults() {
    const nameEl = document.getElementById('liveCheckoutFullName');
    const phoneEl = document.getElementById('liveCheckoutPhone');
    const emailEl = document.getElementById('liveCheckoutEmail');
    const wilayaEl = document.getElementById('liveCheckoutWilaya');
    const cityEl = document.getElementById('liveCheckoutCity');
    if (nameEl && !nameEl.value) nameEl.value = userProfile?.name && userProfile.name !== 'Guest' ? userProfile.name : '';
    if (phoneEl && !phoneEl.value) phoneEl.value = userProfile?.phone || '';
    if (emailEl && !emailEl.value) emailEl.value = currentSupabaseUserEmail || '';
    if (wilayaEl && !wilayaEl.value) wilayaEl.value = userProfile?.location || '';
    if (cityEl && !cityEl.value) cityEl.value = userProfile?.location || '';
}

function renderLiveCheckoutSummary() {
    const listEl = document.getElementById('liveCheckoutSummaryList');
    const emptyEl = document.getElementById('liveCheckoutEmptyState');
    const totalEl = document.getElementById('liveCheckoutSummaryTotal');
    const footerTotalEl = document.getElementById('liveCheckoutFooterTotal');
    const countEl = document.getElementById('liveCheckoutItemCount');
    const submitBtn = document.getElementById('liveCheckoutSubmitBtn');
    if (!listEl || !emptyEl || !totalEl || !footerTotalEl || !countEl || !submitBtn) return;
    const items = getLiveSocialShoppingCartItems();
    const total = getLiveSocialShoppingCartTotal();
    const count = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    countEl.textContent = `${count} item${count === 1 ? '' : 's'}`;
    totalEl.textContent = formatLiveSocialShoppingMoney(total);
    footerTotalEl.textContent = formatLiveSocialShoppingMoney(total);
    submitBtn.disabled = count <= 0;
    if (!items.length) {
        listEl.innerHTML = '';
        emptyEl.style.display = '';
        return;
    }
    emptyEl.style.display = 'none';
    listEl.innerHTML = items.map((item) => `
        <div class="live-checkout-item">
            <div class="live-checkout-item-thumb" style="--live-product-color:${escapeHtml(item.color)};"></div>
            <div class="live-checkout-item-copy">
                <strong>${escapeHtml(item.title)}</strong>
                <span>${escapeHtml(item.sellerName)}${item.location ? ` • ${escapeHtml(item.location)}` : ''}</span>
            </div>
            <div class="live-checkout-item-controls">
                <button class="live-shop-qty-btn" type="button" onclick="changeLiveSocialShoppingCartQuantity('${escapeHtml(item.productId)}', -1)">-</button>
                <span>${escapeHtml(String(item.quantity))}</span>
                <button class="live-shop-qty-btn" type="button" onclick="changeLiveSocialShoppingCartQuantity('${escapeHtml(item.productId)}', 1)">+</button>
            </div>
            <strong>${escapeHtml(formatLiveSocialShoppingMoney(item.subtotal))}</strong>
            <button class="live-checkout-remove-btn" type="button" onclick="removeLiveSocialShoppingProduct('${escapeHtml(item.productId)}')">Remove</button>
        </div>
    `).join('');
    scheduleLucideCreateIcons(document.getElementById('liveCheckoutModal'));
}

function openLiveSocialShoppingCheckout() {
    if (!getLiveSocialShoppingCartItems().length) {
        navigateToSection('live-social-shopping-section');
        showToast('Add products to the cart first', 'shopping-bag');
        return;
    }
    renderLiveCheckoutSummary();
    populateLiveCheckoutDefaults();
    openModal('liveCheckoutModal');
    scheduleLucideCreateIcons(document.getElementById('liveCheckoutModal'));
}

function openLiveSocialShoppingGoLive() {
    if (!requireAuthOrPrompt()) return;
    navigateToSection('create-listing-section');
    try {
        const categorySelect = document.getElementById('listingCategory');
        if (categorySelect && !categorySelect.value) {
            categorySelect.value = 'Boutiques';
            categorySelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } catch (e) {
        null;
    }
    showToast('Create a product listing to go live', 'radio');
}

async function submitLiveSocialShoppingCheckout(event) {
    event?.preventDefault?.();
    const items = getLiveSocialShoppingCartItems();
    if (!items.length) {
        showToast('Your tray is empty', 'shopping-bag');
        return;
    }
    const fullName = document.getElementById('liveCheckoutFullName')?.value?.trim() || '';
    const phone = document.getElementById('liveCheckoutPhone')?.value?.trim() || '';
    const email = document.getElementById('liveCheckoutEmail')?.value?.trim() || '';
    const wilaya = document.getElementById('liveCheckoutWilaya')?.value?.trim() || '';
    const city = document.getElementById('liveCheckoutCity')?.value?.trim() || '';
    const address = document.getElementById('liveCheckoutAddress')?.value?.trim() || '';
    const deliveryMethod = document.getElementById('liveCheckoutDeliveryMethod')?.value?.trim() || 'delivery';
    const paymentMethod = document.getElementById('liveCheckoutPaymentMethod')?.value?.trim() || 'cash_on_delivery';
    const notes = document.getElementById('liveCheckoutNotes')?.value?.trim() || '';
    if (!fullName || !phone || !wilaya || !city || !address) {
        showToast('Please complete the checkout form', 'alert-circle');
        return;
    }
    const submitBtn = document.getElementById('liveCheckoutSubmitBtn');
    const originalText = submitBtn?.textContent || 'Place order request';
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';
    }
    const client = initSupabase();
    try {
        if (!client) throw new Error('Supabase is not configured');
        const payload = {
            full_name: fullName,
            phone,
            email,
            wilaya,
            city,
            address,
            delivery_method: deliveryMethod,
            payment_method: paymentMethod,
            notes,
            total_amount: getLiveSocialShoppingCartTotal(),
            items: items.map((item) => ({
                listing_id: item.listingId,
                title: item.title,
                seller_name: item.sellerName,
                seller_tag: item.sellerTag,
                quantity: item.quantity,
                unit_price: item.price,
                subtotal: item.subtotal
            }))
        };
        const { error } = await client.from('submissions').insert({
            user_id: currentSupabaseUserId || null,
            type: 'live_checkout',
            payload,
            status: 'pending'
        });
        if (error) throw error;
        liveSocialShoppingState.cart = {};
        persistLiveSocialShoppingTray();
        updateLiveShoppingTrayUI();
        renderLiveSocialShoppingSection();
        renderLiveCheckoutSummary();
        closeModal('liveCheckoutModal');
        event?.target?.reset?.();
        showToast('Order request sent', 'check-circle');
    } catch (error) {
        showToast(error?.message || 'Checkout failed', 'alert-circle');
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
}

function renderLiveSocialShoppingSection() {
    const sectionEl = document.getElementById('live-social-shopping-section');
    const root = document.getElementById('liveSocialShoppingRoot');
    if (!sectionEl || !root) return;
    const isAdminViewer = !!userProfile?.isAdmin;
    const publicPreview = !!liveSocialShoppingFeatureEnabledFlag;
    const collections = getLiveSocialShoppingCollections();
    if (!collections.length) {
        root.innerHTML = `
            <div class="live-shop-shell">
                <div class="live-shop-topbar">
                    <div>
                        <div class="live-shop-eyebrow">Live commerce</div>
                        <h2>Live Social Shopping</h2>
                        <p>Publish active listings first, then they appear here automatically as shoppable products.</p>
                    </div>
                    <div class="live-shop-topbar-actions">
                        <span class="live-shop-mode-pill ${publicPreview ? 'is-public' : 'is-admin'}">${publicPreview ? 'Public preview' : 'Admin preview'}</span>
                    </div>
                </div>
                <div class="live-shop-section-card">
                    <div class="live-shop-empty">
                        <i data-lucide="shopping-bag"></i>
                        <h4>No active listings available yet</h4>
                        <p>Create or publish listings to test the live shopping flow with real products from your marketplace.</p>
                    </div>
                </div>
            </div>
        `;
        scheduleLucideCreateIcons(root);
        return;
    }
    const activeCollection = getLiveSocialShoppingCollectionById(liveSocialShoppingState.activeCollection) || collections[0];
    liveSocialShoppingState.activeCollection = activeCollection.id;
    const collectionItems = Array.isArray(activeCollection.items) ? activeCollection.items.slice() : [];
    const spotlightProduct = collectionItems[0] || null;
    const cartItems = getLiveSocialShoppingCartItems();
    const total = getLiveSocialShoppingCartTotal();
    const totalItems = cartItems.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const insightCards = [
        { icon: 'layout-grid', label: 'Products ready', value: String(collectionItems.length) },
        { icon: 'shield-check', label: 'Shopping mode', value: activeCollection.mood || 'Marketplace ready' },
        { icon: 'shopping-bag', label: 'Tray total', value: formatLiveSocialShoppingMoney(total) }
    ];

    root.innerHTML = `
        <div class="live-shop-shell">
            <div class="live-shop-topbar">
                <div>
                    <div class="live-shop-eyebrow">Live commerce</div>
                    <h2>Live Social Shopping</h2>
                    <p>Real marketplace listings, real tray flow, and a checkout request your team can review from the website admin.</p>
                </div>
                <div class="live-shop-topbar-actions">
                    <span class="live-shop-mode-pill ${publicPreview ? 'is-public' : 'is-admin'}">${publicPreview ? 'Public preview' : 'Admin preview'}</span>
                    <span class="live-shop-mode-pill">${collectionItems.length} products ready</span>
                    ${isAdminViewer ? `<button class="live-shop-btn live-shop-btn-ghost" type="button" onclick="openLiveSocialShoppingAdmin()">Admin dashboard</button>` : ''}
                </div>
            </div>

            <div class="live-shop-stage-grid">
                <div class="live-shop-stage-card">
                    <div class="live-shop-stage-visual" style="--live-shop-accent:${escapeHtml(activeCollection.accent)};">
                        <div class="live-shop-stage-glow"></div>
                        <div class="live-shop-stage-pill-row">
                            <span class="live-shop-status-pill is-live">SHOPPABLE NOW</span>
                            <span class="live-shop-status-pill">${escapeHtml(activeCollection.label)}</span>
                        </div>
                        <div class="live-shop-stage-broadcast">
                            <div class="live-shop-stage-screen">
                                <span class="live-shop-stage-dot"></span>
                                <span>${escapeHtml(activeCollection.title)}</span>
                            </div>
                            <div class="live-shop-stage-comments">
                                <div class="live-shop-stage-comment">"Add to tray from any product card"</div>
                                <div class="live-shop-stage-comment">"Checkout sends a real order request to admin submissions"</div>
                            </div>
                        </div>
                        <div class="live-shop-stage-bottom">
                            <div class="live-shop-stage-metric">
                                <strong>${collectionItems.length}</strong>
                                <span>active products in this collection</span>
                            </div>
                            <div class="live-shop-stage-metric">
                                <strong>${escapeHtml(activeCollection.mood)}</strong>
                                <span>${publicPreview ? 'Public users can test this flow now' : 'Admins can test this flow now'}</span>
                            </div>
                        </div>
                    </div>
                    <div class="live-shop-stage-content">
                        <div class="live-shop-heading-row">
                            <div>
                                <div class="live-shop-host-line">endinar.com <span>${escapeHtml(activeCollection.label)}</span></div>
                                <h3>${escapeHtml(activeCollection.title)}</h3>
                            </div>
                            <div class="live-shop-price-chip">${spotlightProduct ? escapeHtml(formatLiveSocialShoppingMoney(spotlightProduct.price)) : 'Live pricing'}</div>
                        </div>
                        <p>${escapeHtml(activeCollection.subtitle)}</p>
                        <div class="live-shop-tag-row">
                            <span class="live-shop-tag">Real listings</span>
                            <span class="live-shop-tag">Navbar tray</span>
                            <span class="live-shop-tag">Admin-submitted checkout</span>
                        </div>
                        <div class="live-shop-action-row">
                            ${spotlightProduct ? `<button class="live-shop-btn live-shop-btn-primary" type="button" onclick="addLiveSocialShoppingProduct('${escapeHtml(String(spotlightProduct.id))}')">Add spotlight item</button>` : ''}
                            <button class="live-shop-btn live-shop-btn-accent" type="button" onclick="openLiveSocialShoppingGoLive()">Go live</button>
                            <button class="live-shop-btn live-shop-btn-ghost" type="button" onclick="openLiveSocialShoppingCheckout()">Open tray</button>
                            ${spotlightProduct ? `<button class="live-shop-btn live-shop-btn-ghost" type="button" onclick="openListingDetail(${Number(spotlightProduct.id) || 0})">View listing</button>` : ''}
                        </div>
                    </div>
                </div>

                <aside class="live-shop-spotlight-card">
                    <div class="live-shop-panel-head">
                        <div>
                            <div class="live-shop-panel-label">Spotlight product</div>
                            <h3>${spotlightProduct ? escapeHtml(spotlightProduct.title) : 'No spotlight yet'}</h3>
                        </div>
                        ${spotlightProduct ? `<span class="live-shop-mode-pill">${escapeHtml(spotlightProduct?.seller?.verified ? 'Verified seller' : (spotlightProduct?.seller?.isVip ? 'VIP seller' : 'Marketplace pick'))}</span>` : ''}
                    </div>
                    ${spotlightProduct ? `
                        <div class="live-shop-spotlight-swatch" style="--live-product-color:${escapeHtml(getLiveSocialShoppingCardColor(spotlightProduct, 0))}; background-image:url('${escapeHtml(spotlightProduct.cardImage || spotlightProduct.image || '')}');"></div>
                        <div class="live-shop-spotlight-meta">
                            <div>
                                <span>Seller</span>
                                <strong>${escapeHtml(spotlightProduct?.seller?.name || 'Seller')}</strong>
                            </div>
                            <div>
                                <span>Location</span>
                                <strong>${escapeHtml(spotlightProduct.location || 'Algeria')}</strong>
                            </div>
                        </div>
                        <div class="live-shop-spotlight-price">${escapeHtml(formatLiveSocialShoppingMoney(spotlightProduct.price))}</div>
                        <div class="live-shop-inline-actions">
                            <button class="live-shop-btn live-shop-btn-primary" type="button" onclick="addLiveSocialShoppingProduct('${escapeHtml(String(spotlightProduct.id))}')">Add to tray</button>
                            <button class="live-shop-btn live-shop-btn-ghost" type="button" onclick="openLiveSocialShoppingCheckout()">Quick checkout</button>
                        </div>
                    ` : '<div class="muted">Select a session to see its pinned product.</div>'}
                </aside>
            </div>

            <div class="live-shop-insights-grid">
                ${insightCards.map((card) => `
                    <div class="live-shop-insight-card">
                        <div class="live-shop-insight-icon"><i data-lucide="${escapeHtml(card.icon)}"></i></div>
                        <div>
                            <span>${escapeHtml(card.label)}</span>
                            <strong>${escapeHtml(card.value)}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>

            <div class="live-shop-filter-row">
                ${collections.map((collection) => `
                    <button class="live-shop-filter-chip ${liveSocialShoppingState.activeCollection === collection.id ? 'active' : ''}" type="button" onclick="setActiveLiveSocialShoppingCollection('${collection.id}')">${escapeHtml(collection.label)}</button>
                `).join('')}
            </div>

            <div class="live-shop-content-grid">
                <div class="live-shop-main-column">
                    <div class="live-shop-section-card">
                        <div class="live-shop-section-head">
                            <div>
                                <div class="live-shop-panel-label">Collections</div>
                                <h3>Shopping rails</h3>
                            </div>
                            <span class="live-shop-mode-pill">${collections.length} available</span>
                        </div>
                        <div class="live-shop-session-grid">
                            ${collections.map((collection) => `
                                <button
                                    class="live-shop-session-card ${collection.id === activeCollection.id ? 'active' : ''}"
                                    type="button"
                                    onclick="setActiveLiveSocialShoppingCollection('${escapeHtml(collection.id)}')"
                                    style="--live-shop-accent:${escapeHtml(collection.accent)};"
                                >
                                    <div class="live-shop-session-cover">
                                        <span class="live-shop-status-pill is-live">${escapeHtml(collection.label)}</span>
                                        <strong>${escapeHtml(String(collection.items?.length || 0))}</strong>
                                    </div>
                                    <div class="live-shop-session-meta">
                                        <div class="live-shop-session-head">
                                            <h4>${escapeHtml(collection.title)}</h4>
                                            <span>${escapeHtml(collection.mood)}</span>
                                        </div>
                                        <p>${escapeHtml(collection.subtitle)}</p>
                                        <div class="live-shop-session-footer">
                                            <span>endinar.com live</span>
                                            <span>${escapeHtml(String(collection.items?.length || 0))} products</span>
                                        </div>
                                    </div>
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="live-shop-section-card">
                        <div class="live-shop-section-head">
                            <div>
                                <div class="live-shop-panel-label">Product rail</div>
                                <h3>Shop this collection</h3>
                            </div>
                            <span class="live-shop-mode-pill">${escapeHtml(activeCollection.label)}</span>
                        </div>
                        <div class="live-shop-products-grid">
                            ${collectionItems.map((product, index) => {
                                const qty = Number(liveSocialShoppingState.cart[String(product.id)]) || 0;
                                return `
                                    <article class="live-shop-product-card">
                                        <div class="live-shop-product-thumb" style="--live-product-color:${escapeHtml(getLiveSocialShoppingCardColor(product, index))}; background-image:url('${escapeHtml(product.cardImage || product.image || '')}');"></div>
                                        <div class="live-shop-product-body">
                                            <div class="live-shop-product-head">
                                                <div>
                                                    <h4>${escapeHtml(product.title)}</h4>
                                                    <span>${escapeHtml(product?.seller?.verified ? 'Verified seller' : (product?.seller?.isVip ? 'VIP seller' : 'Marketplace pick'))}</span>
                                                </div>
                                                <strong>${escapeHtml(formatLiveSocialShoppingMoney(product.price))}</strong>
                                            </div>
                                            <div class="live-shop-product-meta">
                                                <span>${escapeHtml(product.location || 'Algeria')}</span>
                                                <span>${qty ? `${qty} in tray` : 'Tap to add'}</span>
                                            </div>
                                            <div class="live-shop-inline-actions">
                                                <button class="live-shop-btn live-shop-btn-primary" type="button" onclick="addLiveSocialShoppingProduct('${escapeHtml(String(product.id))}')">Add to tray</button>
                                                <button class="live-shop-btn live-shop-btn-ghost" type="button" onclick="openListingDetail(${Number(product.id) || 0})">View listing</button>
                                            </div>
                                        </div>
                                    </article>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>

                <aside class="live-shop-side-column">
                    <div class="live-shop-section-card live-shop-sticky-card">
                        <div class="live-shop-section-head">
                            <div>
                                <div class="live-shop-panel-label">Shopping tray</div>
                                <h3>${totalItems} item${totalItems === 1 ? '' : 's'}</h3>
                            </div>
                            <span class="live-shop-mode-pill">${escapeHtml(formatLiveSocialShoppingMoney(total))}</span>
                        </div>
                        <div class="live-shop-cart-list">
                            ${cartItems.length ? cartItems.map((item) => `
                                <div class="live-shop-cart-item">
                                    <div class="live-shop-cart-copy">
                                        <strong>${escapeHtml(item.name)}</strong>
                                        <span>${escapeHtml(item.host)}</span>
                                    </div>
                                    <div class="live-shop-cart-controls">
                                        <button class="live-shop-qty-btn" type="button" onclick="changeLiveSocialShoppingCartQuantity('${escapeHtml(item.id)}', -1)">-</button>
                                        <span>${escapeHtml(String(item.quantity))}</span>
                                        <button class="live-shop-qty-btn" type="button" onclick="changeLiveSocialShoppingCartQuantity('${escapeHtml(item.id)}', 1)">+</button>
                                    </div>
                                    <strong>${escapeHtml(formatLiveSocialShoppingMoney(item.subtotal))}</strong>
                                </div>
                            `).join('') : `
                                <div class="live-shop-empty">
                                    <i data-lucide="shopping-bag"></i>
                                    <h4>Your tray is empty</h4>
                                    <p>Select a live product to build a quick checkout basket.</p>
                                </div>
                            `}
                        </div>
                        <div class="live-shop-checkout-bar">
                            <div>
                                <span>Total</span>
                                <strong>${escapeHtml(formatLiveSocialShoppingMoney(total))}</strong>
                            </div>
                            <button class="live-shop-btn live-shop-btn-primary" type="button" onclick="openLiveSocialShoppingCheckout()">Checkout</button>
                        </div>
                    </div>

                    <div class="live-shop-section-card">
                        <div class="live-shop-section-head">
                            <div>
                                <div class="live-shop-panel-label">Checkout flow</div>
                                <h3>How this works</h3>
                            </div>
                        </div>
                        <div class="live-shop-schedule-list">
                            ${[
                                ['1', 'Add products to tray', 'Use any Add to tray button from real listings'],
                                ['2', 'Open navbar tray', 'The tray stays visible in the navbar once items exist'],
                                ['3', 'Submit checkout', 'Order request goes into admin submissions for review']
                            ].map(([step, title, subtitle]) => `
                                <button class="live-shop-schedule-item" type="button" onclick="${step === '2' ? 'openLiveSocialShoppingCheckout()' : ''}">
                                    <div>
                                        <strong>${escapeHtml(title)}</strong>
                                        <span>${escapeHtml(subtitle)}</span>
                                    </div>
                                    <span>${escapeHtml(step)}</span>
                                </button>
                            `).join('')}
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    `;
    updateLiveShoppingTrayUI();
    scheduleLucideCreateIcons(root);
}

async function saveFeatureFlagState(key, enabled) {
    const client = initSupabase();
    if (!client) throw new Error('Supabase is not configured');
    const payload = {
        enabled: !!enabled,
        updated_at: new Date().toISOString()
    };
    const { data, error } = await client
        .from('feature_flags')
        .update(payload)
        .eq('key', key)
        .select('key')
        .maybeSingle();
    if (error) throw error;
    if (data?.key) return data;
    const { data: inserted, error: insertError } = await client
        .from('feature_flags')
        .insert({ key, ...payload })
        .select('key')
        .maybeSingle();
    if (insertError) throw insertError;
    return inserted;
}

function showVerifiedPopup(event) {
    event.stopPropagation();
    openModal('verifiedSellerModal');
    scheduleLucideCreateIcons(document.getElementById('verifiedSellerModal'));
}

function showVipPopup(event) {
    event.stopPropagation();
    openModal('vipBadgeModal');
    scheduleLucideCreateIcons(document.getElementById('vipBadgeModal'));
}

function formatUsernameInput(input) {
    let value = input.value.toLowerCase().replace(/\s+/g, '');
    input.value = value;

    const statusEl = document.getElementById('usernameStatus');
    const currentTag = '@' + value;

    if (!value) {
        statusEl.textContent = '';
        statusEl.style.color = 'var(--text-muted)';
        return;
    }

    if (/\s/.test(value)) {
        statusEl.textContent = '❌ No spaces allowed';
        statusEl.style.color = '#dc3545';
        return;
    }

    if (!/^[a-z0-9_.]+$/.test(value)) {
        statusEl.textContent = '❌ Invalid characters';
        statusEl.style.color = '#dc3545';
        return;
    }

    if (!statusEl) return;
    statusEl.textContent = 'Checking...';
    statusEl.style.color = 'var(--text-muted)';
    clearTimeout(window.winjayUsernameCheckTimer);
    window.winjayUsernameCheckTimer = setTimeout(async () => {
        const client = initSupabase();
        if (!client || !currentSupabaseUserId) {
            statusEl.textContent = '✓ Looks good';
            statusEl.style.color = '#28a745';
            return;
        }
        const { data, error } = await client.from('profiles').select('id').eq('tag', currentTag).maybeSingle();
        if (error) {
            statusEl.textContent = '⚠ Unable to check';
            statusEl.style.color = 'var(--text-muted)';
            return;
        }
        if (data?.id && data.id !== currentSupabaseUserId) {
            statusEl.textContent = '❌ Username already taken';
            statusEl.style.color = '#dc3545';
            return;
        }
        statusEl.textContent = '✓ Username available';
        statusEl.style.color = '#28a745';
    }, 250);
}

function commitListingsSearch(searchTerm) {
    triggerListingsRefetch({ immediate: true });
    if (searchTerm && !searchHistory.includes(searchTerm)) {
        searchHistory.unshift(searchTerm);
        if (searchHistory.length > 5) searchHistory.pop();
        localStorage.setItem('winjaySearchHistory', JSON.stringify(searchHistory));
    }
}

let listingsSearchCommitTimer = null;

function scheduleListingsSearchCommit(searchTerm, delayMs = 200) {
    try {
        clearTimeout(listingsSearchCommitTimer);
    } catch (e) {
        null;
    }
    listingsSearchCommitTimer = setTimeout(() => {
        commitListingsSearch(searchTerm);
    }, Math.max(0, Number(delayMs) || 0));
}

function handleSearchTyping(inputId = 'mainSearchInput') {
    const input = document.getElementById(inputId) || document.getElementById('mainSearchInput');
    const searchTerm = (input?.value || '').toLowerCase().trim();
    currentFilters.search = searchTerm;

    const mainInput = document.getElementById('mainSearchInput');
    const mobileExpandInput = document.getElementById('mobileSearchExpandInput');
    if (mainInput && inputId !== 'mainSearchInput') mainInput.value = searchTerm;
    if (mobileExpandInput && inputId !== 'mobileSearchExpandInput') mobileExpandInput.value = searchTerm;

    scheduleProfileSearch(searchTerm);
    try {
        clearTimeout(listingsSearchCommitTimer);
    } catch (e) {
        null;
    }
}

function handleSearch(inputId = 'mainSearchInput', opts = {}) {
    const input = document.getElementById(inputId) || document.getElementById('mainSearchInput');
    const searchTerm = (input?.value || '').toLowerCase().trim();
    currentFilters.search = searchTerm;

    const mainInput = document.getElementById('mainSearchInput');
    const mobileExpandInput = document.getElementById('mobileSearchExpandInput');
    if (mainInput && inputId !== 'mainSearchInput') mainInput.value = searchTerm;
    if (mobileExpandInput && inputId !== 'mobileSearchExpandInput') mobileExpandInput.value = searchTerm;

    scheduleProfileSearch(searchTerm);
    if (opts?.immediate) {
        try {
            clearTimeout(listingsSearchCommitTimer);
        } catch (e) {
            null;
        }
        commitListingsSearch(searchTerm);
        return;
    }
    scheduleListingsSearchCommit(searchTerm, 200);
}

let profileSearchTimer = null;
let lastProfileSearchTerm = '';

function scheduleProfileSearch(term) {
    clearTimeout(profileSearchTimer);
    profileSearchTimer = setTimeout(() => {
        fetchProfileSearchResults(term);
    }, 200);
}

async function fetchProfileSearchResults(term) {
    const container = document.getElementById('profileSearchResults');
    if (!container) return;
    const clean = String(term || '').trim();
    if (!clean || clean.length < 2) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    if (clean === lastProfileSearchTerm) return;
    lastProfileSearchTerm = clean;

    const client = initSupabase();
    if (!client) return;

    const safe = clean.replace(/[,%]/g, '').slice(0, 32);
    const tagPrefix = safe.startsWith('@') ? safe : '@' + safe;
    const orClause = `tag.ilike.${tagPrefix}%,display_name.ilike.%${safe}%`;
    const { data, error } = await client
        .from('profiles')
        .select('id, display_name, tag, avatar_url')
        .or(orClause)
        .limit(6);
    if (error) return;
    const rows = Array.isArray(data) ? data : [];
    if (rows.length === 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }
    container.innerHTML = `
        <div class="profile-search-header">People</div>
        ${rows
            .map((p) => {
                const pic = p.avatar_url || DEFAULT_AVATAR_SVG;
                const name = p.display_name || 'User';
                const tag = p.tag || '';
                return `
                    <div class="profile-search-item" onclick="openSellerProfileByOwnerId('${p.id}')">
                        <img class="profile-search-avatar" src="${pic}" alt="">
                        <div class="profile-search-meta">
                            <div class="profile-search-name">${name}</div>
                            <div class="profile-search-tag">${tag}</div>
                        </div>
                    </div>`;
            })
            .join('')}
    `;
    container.style.display = 'block';
}

function showSearchHistory(inputId = 'mainSearchInput', dropdownId = 'searchHistoryDropdown', listId = 'searchHistoryList') {
    const saved = localStorage.getItem('winjaySearchHistory');
    if (saved) searchHistory = JSON.parse(saved);
    const dropdown = document.getElementById(dropdownId);
    const list = document.getElementById(listId);
    const input = document.getElementById(inputId);
    if (!dropdown || !list || !input) return;
    if (searchHistory.length > 0) {
        list.innerHTML = searchHistory.map(term => `
            <div class="search-history-item" onclick="selectSearchTerm('${term}')">
                <i data-lucide="clock"></i>
                <span>${term}</span>
            </div>`).join('');
        dropdown.classList.add('active');
        scheduleLucideCreateIcons(dropdown);
    }
}

function selectSearchTerm(term) {
    document.getElementById('mainSearchInput').value = term;
    const mobileExpand = document.getElementById('mobileSearchExpandInput');
    if (mobileExpand) mobileExpand.value = term;
    document.getElementById('searchHistoryDropdown').classList.remove('active');
    document.getElementById('mobileSearchHistoryDropdown')?.classList.remove('active');
    handleSearch('mainSearchInput', { immediate: true });
    showSection('home-section');
    closeMobileSearchExpand();
}

function clearSearchHistory() {
    searchHistory = [];
    localStorage.removeItem('winjaySearchHistory');
    document.getElementById('searchHistoryDropdown').classList.remove('active');
    document.getElementById('mobileSearchHistoryDropdown')?.classList.remove('active');
}

document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('searchHistoryDropdown');
    const searchContainer = document.querySelector('.nav-center');
    if (searchContainer && !searchContainer.contains(e.target)) {
        dropdown.classList.remove('active');
    }

    const mobilePanel = document.getElementById('mobileSearchExpand');
    const mobileBtn = document.querySelector('.mobile-search-btn');
    if (mobilePanel?.classList.contains('active')) {
        const mobileContainer = document.querySelector('#mobileSearchExpand .mobile-search-container');
        const clickedInsidePanel = mobileContainer ? mobileContainer.contains(e.target) : false;
        const clickedBtn = mobileBtn ? mobileBtn.contains(e.target) : false;
        if (!clickedInsidePanel && !clickedBtn) {
            closeMobileSearchExpand();
        }
    }

    const profileDropdown = document.getElementById('profileDropdown');
    if (profileDropdown?.classList.contains('active')) {
        const wrapper = document.querySelector('.profile-menu-wrapper');
        const clickedInside = wrapper ? wrapper.contains(e.target) : false;
        if (!clickedInside) {
            closeProfileDropdown();
        }
    }
});

function checkPasswordStrength() {
    const password = document.getElementById('registerPassword').value;
    const bars = [
        document.getElementById('strengthBar1'),
        document.getElementById('strengthBar2'),
        document.getElementById('strengthBar3'),
        document.getElementById('strengthBar4')
    ];
    const text = document.getElementById('strengthText');
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) strength++;
    const levels = ['', 'weak', 'fair', 'good', 'strong'];
    const labels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];
    bars.forEach((bar, i) => {
        bar.className = 'strength-bar';
        if (i < strength) bar.classList.add(levels[strength]);
    });
    text.textContent = labels[strength];
    text.className = 'strength-text ' + levels[strength];
}

function loginWithGoogle() {
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    try {
        localStorage.setItem('winjayRememberMe', 'true');
    } catch (e) {
        null;
    }
    showToast('Connecting with Google...', 'log-in');
    const redirectTo = `${window.location.origin}${window.location.pathname}`;
    client.auth
        .signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo,
                skipBrowserRedirect: true
            }
        })
        .then(({ data, error }) => {
            if (error) {
                showToast(error.message || 'Google login failed', 'alert-circle');
                return;
            }
            const url = data?.url ? String(data.url) : '';
            if (url) {
                window.location.replace(url);
                return;
            }
            return client.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo }
            });
        })
        .then(({ error } = {}) => {
            if (error) showToast(error.message || 'Google login failed', 'alert-circle');
        });
}

function openForgotPassword() {
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    const email = document.getElementById('loginEmail')?.value?.trim();
    if (!email) {
        showToast('Enter your email', 'alert-circle');
        return;
    }
    client.auth.resetPasswordForEmail(email).then(({ error }) => {
        if (error) {
            showToast(error.message || 'Error', 'alert-circle');
            return;
        }
        closeModal('loginModal');
        showToast('Password reset email sent', 'mail');
    });
}

function getSimilarListings(item) {
    return listings.filter(l => l.id !== item.id && (l.category === item.category || l.location === item.location)).slice(0, 4);
}

function handleCardOpen(e, listingId) {
    const id = Number(listingId) || 0;
    if (!id) return;
    try {
        const target = e?.target || null;
        const carousel = target && typeof target.closest === 'function' ? target.closest('.js-carousel[data-carousel="card"]') : null;
        if (carousel) {
            if (carousel.dataset.dragging === '1') return;
            if (Date.now() - (Number(lastCarouselSwipeAt) || 0) < 900) return;
        }
    } catch (err) {
        null;
    }
    openListingDetail(id);
}

function createMyListingCardHTML(item) {
    const isFavorite = favorites.includes(item.id);
    const pulse = pendingHeartPulses.has(item.id) && isFavorite;
    const carouselImages = getListingImagesForCard(item).slice(0, 8);
    const mediaHTML = carouselImages.length > 1
        ? `<div class="card-media-wrap"><div class="card-carousel js-carousel" data-carousel="card" data-listing-id="${item.id}" data-index="0">
                <div class="carousel-viewport">
                    <div class="carousel-track">
                        ${carouselImages.map((u) => `<div class="carousel-slide"><img src="${u}" data-src="${u}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low" draggable="false"></div>`).join('')}
                    </div>
                </div>
                <div class="carousel-dots">
                    ${carouselImages.map((_, i) => `<button type="button" class="carousel-dot ${i === 0 ? 'active' : ''}" data-dot-index="${i}"></button>`).join('')}
                </div>
            </div></div>`
        : `<div class="card-media-wrap"><img src="${item.cardImage || item.image}" data-src="${item.cardImage || item.image}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low"></div>`;
    return `
        <div class="card my-listing-card" onclick="handleCardOpen(event, ${item.id})">
            <div class="listing-actions">
                <button class="action-btn edit" onclick="openEditListingPage(event, ${item.id})">
                    <i data-lucide="pencil"></i>
                </button>
                <button class="action-btn delete" onclick="deleteMyListing(event, ${item.id})">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
            <button class="favorite-btn ${isFavorite ? 'active' : ''} ${pulse ? 'pulse' : ''}" onclick="toggleFavorite(event, ${item.id})">
                <i data-lucide="heart"></i>
            </button>
            ${mediaHTML}
            <div class="card-content">
                <div class="card-price">${new Intl.NumberFormat('fr-DZ').format(item.price)} DZD</div>
                <div class="card-title">${item.title}</div>
                <div class="card-footer">
                    <span><i data-lucide="map-pin" style="width:12px"></i> ${item.location}</span>
                    <span>${item.date}</span>
                </div>
            </div>
        </div>`;
}

async function saveEditedListing() {
    const item = listings.find(l => l.id === editingListingId);
    if (!item) return;
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    const nextTitle = document.getElementById('editListingTitle').value.trim();
    const nextDescription = document.getElementById('editListingDescription')?.value?.trim?.() || '';
    const nextCondition = document.getElementById('editListingCondition')?.value || '';
    const nextPriceType = document.getElementById('editListingPriceType')?.value || '';
    const nextPrice = Number(document.getElementById('editListingPrice').value) || 0;
    const nextCategory = document.getElementById('editListingCategory').value || null;
    const nextSubcategory = document.getElementById('editListingSubcategory')?.value || '';
    const nextWilaya = document.getElementById('editListingWilaya').value || null;
    const nextCity = document.getElementById('editListingCity')?.value || '';
    const nextDelivery = document.getElementById('editListingDelivery')?.value || '';
    const nextPhone = document.getElementById('editListingContactPhone')?.value?.trim?.() || '';
    const nextAvailability = document.getElementById('editListingAvailability')?.value || 'Available';
    const tagsRaw = document.getElementById('editListingTags')?.value || '';
    const nextTags = Array.from(
        new Map(
            tagsRaw
                .split(',')
                .map((t) => String(t || '').trim())
                .filter(Boolean)
                .map((t) => [t.toLowerCase(), t])
        ).values()
    ).slice(0, 5);

    if (!nextTitle) {
        showToast('Title is required', 'alert-circle');
        return;
    }
    if (!nextCondition) {
        showToast('Condition is required', 'alert-circle');
        return;
    }
    if (!nextPriceType) {
        showToast('Price type is required', 'alert-circle');
        return;
    }
    if (nextPriceType !== 'Free' && nextPrice <= 0) {
        showToast('Price is required', 'alert-circle');
        return;
    }
    if (!nextSubcategory && nextCategory && Array.isArray(listingSubcategoriesByCategory[nextCategory]) && listingSubcategoriesByCategory[nextCategory].length) {
        showToast('Subcategory is required', 'alert-circle');
        return;
    }
    if (!nextWilaya) {
        showToast('Wilaya is required', 'alert-circle');
        return;
    }
    if (!nextCity) {
        showToast('City / Commune is required', 'alert-circle');
        return;
    }
    if (!nextDelivery) {
        showToast('Delivery is required', 'alert-circle');
        return;
    }
    if (!nextPhone) {
        showToast('Phone number is required', 'alert-circle');
        return;
    }
    const { error } = await client
        .from('listings')
        .update({
            title: nextTitle,
            description: nextDescription || null,
            condition: nextCondition || null,
            price_type: nextPriceType || null,
            subcategory: nextSubcategory || null,
            price: nextPrice,
            delivery: nextDelivery || null,
            availability: nextAvailability || null,
            category: nextCategory,
            wilaya: nextWilaya,
            city: nextCity || null,
            contact_phone: nextPhone || null,
            tags: nextTags.length ? nextTags : null
        })
        .eq('id', editingListingId)
        .eq('owner_id', currentSupabaseUserId);
    if (error) {
        showToast(error.message || 'Failed to update listing', 'alert-circle');
        return;
    }
    closeModal('editListingModal');
    showToast('Listing updated!', 'check-circle');
    clearCardHtmlCache();
    await fetchListingsFromSupabase({ silent: true });
}

function deleteMyListing(event, id) {
    event.stopPropagation();
    showConfirmModal(
        'Supprimer l\'annonce',
        'Êtes-vous sûr de vouloir supprimer cette annonce ?',
        async () => {
            if (!requireAuthOrPrompt()) return;
            const client = initSupabase();
            if (!client) {
                showToast('Supabase is not configured', 'alert-circle');
                return;
            }
            const deletedAt = new Date().toISOString();
            const { data: deletedRow, error } = await client
                .from('listings')
                .update({ deleted_at: deletedAt })
                .eq('id', id)
                .eq('owner_id', currentSupabaseUserId)
                .is('deleted_at', null)
                .select('id')
                .maybeSingle();
            if (error) {
                showToast(error.message || 'Failed to delete listing', 'alert-circle');
                return;
            }
            if (!deletedRow?.id) {
                showToast('Delete failed: listing not found or not allowed', 'alert-circle');
                return;
            }
            reflectDeletedListingInUi(id);
            showToast('Listing deleted', 'trash-2');
            void fetchListingsFromSupabase({ silent: true });
        },
        true
    );
}

function renderMyListings() {
    myListingsGrid.innerHTML = myListings.length > 0 ?
        myListings.map(item => createMyListingCardHTML(item)).join('') :
        '<div class="empty-state"><i data-lucide="shopping-bag"></i><h3>Pas encore d\'annonces</h3><p>Publiez votre première annonce !</p></div>';
    initCarouselsInContainer(myListingsGrid);
    scheduleLucideCreateIcons();
}

let myProfileListingsLoaded = false;

async function ensureMyProfileListingsLoaded() {
    if (myProfileListingsLoaded) return true;
    if (!currentSupabaseUserId) return false;
    try {
        const client = initSupabase();
        if (!client) return false;
        const baseSelect = 'id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, listing_images(url, thumbnail_url, sort_order)';
        const { data, error } = await client
            .from('listings')
            .select(baseSelect)
            .eq('owner_id', currentSupabaseUserId)
            .is('deleted_at', null)
            .order('created_at', { ascending: false })
            .limit(100);
        if (error) return false;
        const mapped = (data || []).map((row) => mapSupabaseListingRow(row, {}));
        
        // Merge into global listings to keep everything in sync
        const byId = new Map((listings || []).map((x) => [x.id, x]));
        mapped.forEach((x) => byId.set(x.id, x));
        listings = Array.from(byId.values()).sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
        
        // Directly set myListings from our fresh fetch
        myListings = mapped;
        
        myProfileListingsLoaded = true;
        return true;
    } catch (e) {
        return false;
    }
}

function renderMyProfileReviews() {
    const list = document.getElementById('myProfileReviewsList');
    if (!list) return;
    list.innerHTML = getReviewsListHTML(userProfile.reviewsData || [], userProfile.name, false, 'profile', userProfile.tag);
    scheduleLucideCreateIcons(list);
}

let myProfileReviewsLoaded = false;

async function ensureMyProfileReviewsLoaded() {
    if (myProfileReviewsLoaded) return true;
    if (!currentSupabaseUserId) return false;
    try {
        userProfile.reviewsData = await fetchProfileReviews(currentSupabaseUserId);
        const summary = computeRatingSummaryFromReviews(userProfile.reviewsData);
        userProfile.rating = summary.rating;
        userProfile.reviews = summary.reviews;
        updateProfileUI();
        myProfileReviewsLoaded = true;
        return true;
    } catch (e) {
        return false;
    }
}

async function switchMyProfileSection(section) {
    const listingsTab = document.getElementById('myProfileListingsTab');
    const reviewsTab = document.getElementById('myProfileReviewsTab');
    const coursesTab = document.getElementById('myProfileCoursesTab');
    const listingsPanel = document.getElementById('myProfileListingsSection');
    const reviewsPanel = document.getElementById('myProfileReviewsSection');
    const coursesPanel = document.getElementById('myProfileCoursesSection');
    if (!listingsTab || !reviewsTab || !coursesTab || !listingsPanel || !reviewsPanel || !coursesPanel) return;

    const key = String(section || '').toLowerCase();
    const showListings = key === 'listings' || (!key || (key !== 'reviews' && key !== 'courses'));
    const showReviews = key === 'reviews';
    const showCourses = key === 'courses' && isCoursesFeatureEnabledForViewer();

    try {
        localStorage.setItem(MY_PROFILE_LAST_TAB_STORAGE_KEY, showCourses ? 'courses' : showReviews ? 'reviews' : 'listings');
    } catch (e) {
        null;
    }

    listingsTab.classList.toggle('active', showListings);
    reviewsTab.classList.toggle('active', showReviews);
    coursesTab.classList.toggle('active', showCourses);
    listingsPanel.classList.toggle('active', showListings);
    reviewsPanel.classList.toggle('active', showReviews);
    coursesPanel.classList.toggle('active', showCourses);

    if (showReviews) {
        const list = document.getElementById('myProfileReviewsList');
        if (list && !myProfileReviewsLoaded) {
            list.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);"><i data-lucide="loader" style="width: 36px; height: 36px;"></i><p style="margin-top: 10px;">Loading reviews...</p></div>`;
            scheduleLucideCreateIcons(list);
        }
        const ok = await ensureMyProfileReviewsLoaded();
        if (!ok) {
            showToast('Failed to load profile reviews', 'alert-circle');
            return;
        }
        renderMyProfileReviews();
    }
    if (showCourses) {
        await renderMyProfileCoursesPanel();
    }
}

let adminActiveTab = 'overview';

function getLiveVisitorsCount() {
    try {
        if (!livePresenceChannel) return 0;
        const state = livePresenceChannel.presenceState?.() || {};
        return Object.keys(state || {}).length;
    } catch (e) {
        return 0;
    }
}

function updateAdminOnlineKpiValue() {
    const el = document.getElementById('adminKpiOnlineValue');
    if (!el) return;
    el.textContent = String(getLiveVisitorsCount());
}

function adminBadge(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') return `<span class="admin-badge ok">APPROVED</span>`;
    if (s === 'rejected') return `<span class="admin-badge no">REJECTED</span>`;
    if (s === 'pending') return `<span class="admin-badge pending">PENDING</span>`;
    return `<span class="admin-badge">${escapeHtml(status || '—')}</span>`;
}

function isAdminAuthorized() {
    return !!(userProfile && userProfile.isAdmin);
}

function clearPendingAdminOpen() {
    try {
        sessionStorage.removeItem(ADMIN_PENDING_OPEN_KEY);
    } catch (e) {
        null;
    }
}

function maybeOpenPendingAdmin() {
    let pending = null;
    try {
        pending = sessionStorage.getItem(ADMIN_PENDING_OPEN_KEY);
    } catch (e) {
        pending = null;
    }
    if (!pending) return;
    if (!isLoggedIn()) {
        openModal('loginModal');
        return;
    }
    if (!isAdminAuthorized()) {
        clearPendingAdminOpen();
        showToast('Not authorized', 'alert-circle');
        return;
    }
    clearPendingAdminOpen();
    showSection('admin-dashboard-section');
}

function setActiveAdminTab(tab) {
    adminActiveTab = tab;
    const tabs = [
        ['overview', 'adminTabOverview', 'adminPanelOverview'],
        ['users', 'adminTabUsers', 'adminPanelUsers'],
        ['vip', 'adminTabVip', 'adminPanelVip'],
        ['verified', 'adminTabVerified', 'adminPanelVerified'],
        ['moderation', 'adminTabModeration', 'adminPanelModeration'],
        ['submissions', 'adminTabSubmissions', 'adminPanelSubmissions'],
        ['banners', 'adminTabBanners', 'adminPanelBanners'],
        ['live', 'adminTabLive', 'adminPanelLive']
    ];
    tabs.forEach(([key, tabId, panelId]) => {
        document.getElementById(tabId)?.classList?.toggle('active', key === tab);
        document.getElementById(panelId)?.classList?.toggle('active', key === tab);
    });
    updateLivePresence();
}

function switchAdminTab(tab) {
    if (!isAdminAuthorized()) {
        showToast('Not authorized', 'alert-circle');
        showSection('home-section');
        return;
    }
    setActiveAdminTab(tab);
    renderAdminDashboard();
}

function relationMissing(err, name) {
    const msg = String(err?.message || '').toLowerCase();
    const n = String(name || '').toLowerCase();
    return msg.includes('relation') && msg.includes(n) && msg.includes('does not exist');
}

async function adminCount(table, build) {
    const client = initSupabase();
    if (!client) return { count: 0, error: new Error('Supabase is not configured') };
    let q = client.from(table).select('id', { count: 'exact', head: true });
    if (typeof build === 'function') q = build(q);
    const { count, error } = await q;
    return { count: Number(count) || 0, error };
}

async function adminFetchFunnelMetrics(days = 7) {
    const client = initSupabase();
    if (!client) return null;
    try {
        const { data, error } = await client.rpc('admin_funnel_metrics', { days: Number(days) || 7 });
        if (error || !data) return null;
        return data;
    } catch (e) {
        return null;
    }
}

async function renderAdminKpis() {
    const el = document.getElementById('adminKpis');
    if (!el) return;
    if (!isAdminAuthorized()) {
        el.innerHTML = '';
        return;
    }
    const onlineNow = getLiveVisitorsCount();
    const users = await adminCount('profiles');
    const listingsCount = await adminCount('listings');
    const vipPending = await adminCount('vip_applications', (q) => q.eq('status', 'pending'));
    const verifiedPending = await adminCount('verified_applications', (q) => q.eq('status', 'pending'));
    const identityPending = await adminCount('identity_applications', (q) => q.eq('status', 'pending'));
    const submissionsPending = await adminCount('submissions', (q) => q.eq('status', 'pending'));
    const funnel = await adminFetchFunnelMetrics(7);
    const homeToChatRate = funnel?.rates?.home_to_chat ?? null;
    const chatSessions = funnel?.sessions?.chat ?? null;
    const items = [
        { icon: 'activity', label: 'Online now', valueHtml: `<span id="adminKpiOnlineValue">${escapeHtml(String(onlineNow))}</span>` },
        { icon: 'users', label: 'Users', value: users.error ? '—' : users.count },
        { icon: 'layout-grid', label: 'Listings', value: listingsCount.error ? '—' : listingsCount.count },
        { icon: 'trending-up', label: 'Home→Chat (7d)', value: homeToChatRate === null || homeToChatRate === undefined ? '—' : `${(Number(homeToChatRate) * 100).toFixed(1)}%` },
        { icon: 'message-circle', label: 'Chat starts (7d)', value: chatSessions === null || chatSessions === undefined ? '—' : Number(chatSessions) || 0 },
        { icon: 'crown', label: 'VIP pending', value: vipPending.error ? '—' : vipPending.count },
        { icon: 'badge-check', label: 'Verified pending', value: verifiedPending.error ? '—' : verifiedPending.count },
        { icon: 'scan-face', label: 'Identity pending', value: identityPending.error ? '—' : identityPending.count },
        { icon: 'inbox', label: 'Submissions', value: submissionsPending.error ? '—' : submissionsPending.count }
    ];
    el.innerHTML = items
        .map(
            (x) => `
            <div class="admin-kpi">
                <div class="kpi-label"><i data-lucide="${x.icon}"></i> ${escapeHtml(x.label)}</div>
                <div class="kpi-value">${x.valueHtml ? x.valueHtml : escapeHtml(String(x.value))}</div>
            </div>
        `
        )
        .join('');
    scheduleLucideCreateIcons();
}

async function fetchProfilesForAdmin(userIds) {
    const client = initSupabase();
    if (!client) return {};
    const ids = Array.from(new Set((userIds || []).filter(Boolean)));
    if (!ids.length) return {};
    const { data, error } = await client.from('profiles').select('id, display_name, tag, avatar_url, is_vip, verified').in('id', ids).limit(500);
    if (error) return {};
    const out = {};
    (data || []).forEach((p) => {
        if (p?.id) out[p.id] = p;
    });
    return out;
}

function formatAdminDate(ts) {
    try {
        if (!ts) return '';
        const d = new Date(ts);
        if (Number.isNaN(d.getTime())) return '';
        return d.toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
        return '';
    }
}

let lastAdminUsers = [];

async function adminFetchUsersWithEmailPhone(search) {
    const client = initSupabase();
    if (!client) return null;
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData?.session?.access_token || '';
    if (!token) return null;
    try {
        const res = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/admin-list-users`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                apikey: SUPABASE_ANON_KEY,
                authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ search: String(search || '').trim() })
        });
        if (!res.ok) return null;
        const payload = await res.json();
        if (!payload || !Array.isArray(payload.users)) return null;
        return payload.users;
    } catch (e) {
        return null;
    }
}

async function renderAdminUsers() {
    if (!isAdminAuthorized()) return;
    const tbody = document.getElementById('adminUsersTbody');
    if (!tbody) return;
    const client = initSupabase();
    if (!client) return;
    const search = document.getElementById('adminUserSearch')?.value?.trim() || '';

    let users = await adminFetchUsersWithEmailPhone(search);
    if (!users) {
        let q = client
            .from('profiles')
            .select('id, display_name, tag, phone, is_vip, verified, created_at')
            .order('created_at', { ascending: false })
            .limit(120);
        if (search) {
            const term = `%${search}%`;
            q = q.or(`display_name.ilike.${term},tag.ilike.${term}`);
        }
        const { data, error } = await q;
        if (error) {
            tbody.innerHTML = '';
            showToast(error.message || 'Failed to load users', 'alert-circle');
            return;
        }
        users = (data || []).map((u) => ({ ...u, email: '' }));
    }

    lastAdminUsers = Array.isArray(users) ? users.slice() : [];

    const rows = (users || []).map((u) => {
        const vip = u.is_vip ? adminBadge('approved') : adminBadge('—');
        const verified = u.verified ? adminBadge('approved') : adminBadge('—');
        return `
            <tr>
                <td>${escapeHtml(u.display_name || 'User')}</td>
                <td>${escapeHtml(u.tag || '')}</td>
                <td>${escapeHtml(u.email || '')}</td>
                <td>${escapeHtml(u.phone || '')}</td>
                <td>${vip}</td>
                <td>${verified}</td>
                <td>${escapeHtml(formatAdminDate(u.created_at))}</td>
                <td>
                    <div class="admin-actions">
                        <button class="admin-action-btn" type="button" onclick="adminToggleVip('${u.id}', ${u.is_vip ? 'false' : 'true'})">${u.is_vip ? 'Remove VIP' : 'Grant VIP'}</button>
                        <button class="admin-action-btn" type="button" onclick="adminToggleVerified('${u.id}', ${u.verified ? 'false' : 'true'})">${u.verified ? 'Remove Verified' : 'Grant Verified'}</button>
                        <button class="admin-action-btn danger" type="button" onclick="adminDeleteUser('${u.id}')">Delete User</button>
                    </div>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = rows.join('');
}

function adminDownloadUsersPdf() {
    if (!isAdminAuthorized()) return;
    if (!Array.isArray(lastAdminUsers) || lastAdminUsers.length === 0) {
        showToast('No users to export', 'alert-circle');
        return;
    }

    const now = new Date();
    const title = `endinar.com - Users Export`;
    const subtitle = `Generated: ${now.toLocaleString('fr-FR')}`;
    const rows = lastAdminUsers
        .map((u) => {
            const vip = u.is_vip ? 'YES' : 'NO';
            const verified = u.verified ? 'YES' : 'NO';
            return `
                <tr>
                    <td>${escapeHtml(u.display_name || 'User')}</td>
                    <td>${escapeHtml(u.tag || '')}</td>
                    <td>${escapeHtml(u.email || '')}</td>
                    <td>${escapeHtml(u.phone || '')}</td>
                    <td>${escapeHtml(vip)}</td>
                    <td>${escapeHtml(verified)}</td>
                    <td>${escapeHtml(formatAdminDate(u.created_at))}</td>
                </tr>
            `;
        })
        .join('');

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#0f1419}
    h1{margin:0 0 6px;font-size:20px}
    .sub{margin:0 0 18px;color:#536471;font-size:12px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{border:1px solid #e1e8ed;padding:8px;vertical-align:top}
    th{background:#f5f8fa;text-align:left}
    .muted{color:#536471}
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p class="sub">${escapeHtml(subtitle)}</p>
  <table>
    <thead>
      <tr>
        <th>User</th>
        <th>Tag</th>
        <th>Email</th>
        <th>Phone</th>
        <th>VIP</th>
        <th>Verified</th>
        <th>Joined</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <p class="sub muted" style="margin-top:14px;">Use your browser print dialog and choose "Save as PDF".</p>
</body>
</html>`;

    const w = window.open('', '_blank', 'noopener,noreferrer');
    if (!w) {
        showToast('Popup blocked. Allow popups to export PDF.', 'alert-circle');
        return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    setTimeout(() => {
        try {
            w.print();
        } catch (e) {
            null;
        }
    }, 250);
}

async function adminToggleVip(userId, next) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.rpc('admin_set_vip', { target_user_id: String(userId), next: !!next });
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    showToast('Saved', 'check-circle');
    renderAdminUsers();
    renderAdminKpis();
}

async function adminToggleVerified(userId, next) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.rpc('admin_set_verified', { target_user_id: String(userId), next: !!next });
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    showToast('Saved', 'check-circle');
    renderAdminUsers();
    renderAdminKpis();
}

async function adminDeleteUser(userId) {
    if (!isAdminAuthorized()) return;
    const targetId = String(userId || '').trim();
    if (!targetId) return;
    if (currentSupabaseUserId && targetId === currentSupabaseUserId) {
        showToast('You cannot delete your own admin account here.', 'alert-circle');
        return;
    }
    showConfirmModal(
        'Delete user',
        'Are you sure you want to delete this user permanently? This cannot be undone.',
        () => adminPerformUserDeletion(targetId),
        true,
        'Delete',
        'Cancel'
    );
}

async function adminPerformUserDeletion(targetId) {
    const userId = String(targetId || '').trim();
    if (!userId) return;
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    const { data: sessionData, error: sessionErr } = await client.auth.getSession();
    const token = sessionData?.session?.access_token || '';
    if (sessionErr || !token) {
        showToast('Please log in again', 'log-in');
        openModal('loginModal');
        return;
    }

    try {
        const res = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/admin-delete-user`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                apikey: SUPABASE_ANON_KEY,
                authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ user_id: targetId })
        });
        const raw = await res.text();
        let payload = null;
        try {
            payload = raw ? JSON.parse(raw) : null;
        } catch (e) {
            payload = null;
        }
        if (!res.ok) {
            showToast(payload?.error || 'Delete failed', 'alert-circle');
            return;
        }
        showToast('User deleted', 'check-circle');
        renderAdminUsers();
        renderAdminKpis();
    } catch (e) {
        showToast('Delete failed', 'alert-circle');
    }
}

async function renderVipApplications() {
    if (!isAdminAuthorized()) return;
    const tbody = document.getElementById('adminVipTbody');
    if (!tbody) return;
    const client = initSupabase();
    if (!client) return;
    const { data, error } = await client.from('vip_applications').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) {
        tbody.innerHTML = '';
        if (!relationMissing(error, 'vip_applications')) showToast(error.message || 'Failed to load VIP', 'alert-circle');
        return;
    }
    const ids = (data || []).map((x) => x.user_id).filter(Boolean);
    const profiles = await fetchProfilesForAdmin(ids);
    tbody.innerHTML = (data || [])
        .map((a) => {
            const p = profiles[a.user_id] || {};
            const actions =
                a.status === 'pending'
                    ? `<div class="admin-actions">
                        <button class="admin-action-btn primary" type="button" onclick="adminApproveVip('${a.id}','${a.user_id}')">Approve</button>
                        <button class="admin-action-btn danger" type="button" onclick="adminRejectVip('${a.id}')">Reject</button>
                    </div>`
                    : '';
            return `
                <tr>
                    <td>${escapeHtml(p.display_name || 'User')} <span class="muted">${escapeHtml(p.tag || '')}</span></td>
                    <td>${escapeHtml(a.plan || '')}</td>
                    <td>${escapeHtml(a.phone || '')}</td>
                    <td>${escapeHtml(a.wilaya || '')}</td>
                    <td>${adminBadge(a.status)}</td>
                    <td>${actions}</td>
                </tr>
            `;
        })
        .join('');
}

async function adminApproveVip(appId, userId) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.rpc('admin_approve_vip', { app_id: String(appId) });
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    showToast('VIP approved', 'check-circle');
    renderVipApplications();
    renderAdminKpis();
}

async function adminRejectVip(appId) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.rpc('admin_reject_vip', { app_id: String(appId) });
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    showToast('Rejected', 'check-circle');
    renderVipApplications();
    renderAdminKpis();
}

async function renderVerifiedApplications() {
    if (!isAdminAuthorized()) return;
    const tbody = document.getElementById('adminVerifiedTbody');
    if (!tbody) return;
    const client = initSupabase();
    if (!client) return;
    const { data, error } = await client.from('verified_applications').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) {
        tbody.innerHTML = '';
        if (!relationMissing(error, 'verified_applications')) showToast(error.message || 'Failed to load Verified', 'alert-circle');
        return;
    }
    const ids = (data || []).map((x) => x.user_id).filter(Boolean);
    const profiles = await fetchProfilesForAdmin(ids);
    tbody.innerHTML = (data || [])
        .map((a) => {
            const p = profiles[a.user_id] || {};
            const actions =
                a.status === 'pending'
                    ? `<div class="admin-actions">
                        <button class="admin-action-btn primary" type="button" onclick="adminApproveVerified('${a.id}','${a.user_id}')">Approve</button>
                        <button class="admin-action-btn danger" type="button" onclick="adminRejectVerified('${a.id}')">Reject</button>
                    </div>`
                    : '';
            return `
                <tr>
                    <td>${escapeHtml(p.display_name || 'User')} <span class="muted">${escapeHtml(p.tag || '')}</span></td>
                    <td>${escapeHtml(a.plan || '')}</td>
                    <td>${escapeHtml(a.phone || '')}</td>
                    <td>${escapeHtml(a.wilaya || '')}</td>
                    <td>${adminBadge(a.status)}</td>
                    <td>${actions}</td>
                </tr>
            `;
        })
        .join('');
}

async function adminApproveVerified(appId, userId) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.rpc('admin_approve_verified', { app_id: String(appId) });
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    showToast('Verified approved', 'check-circle');
    renderVerifiedApplications();
    renderAdminKpis();
}

async function adminRejectVerified(appId) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.rpc('admin_reject_verified', { app_id: String(appId) });
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    showToast('Rejected', 'check-circle');
    renderVerifiedApplications();
    renderAdminKpis();
}

async function renderIdentityApplications() {
    if (!isAdminAuthorized()) return;
    const tbody = document.getElementById('adminIdentityTbody');
    if (!tbody) return;
    const client = initSupabase();
    if (!client) return;
    const { data, error } = await client.from('identity_applications').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) {
        tbody.innerHTML = '';
        if (!relationMissing(error, 'identity_applications')) showToast(error.message || 'Failed to load identity submissions', 'alert-circle');
        return;
    }
    const ids = (data || []).map((x) => x.user_id).filter(Boolean);
    const profiles = await fetchProfilesForAdmin(ids);
    tbody.innerHTML = (data || [])
        .map((a) => {
            const p = profiles[a.user_id] || {};
            const safeUserId = escapeJsString(a.user_id || '');
            const safeFront = escapeJsString(a.front_path || '');
            const safeBack = escapeJsString(a.back_path || '');
            const actions = `
                <div class="admin-actions">
                    <button class="admin-action-btn" type="button" onclick="adminOpenIdentityDocs('${safeUserId}','${safeFront}','${safeBack}')">View</button>
                    ${a.status === 'pending' ? `<button class="admin-action-btn primary" type="button" onclick="adminApproveIdentity('${a.id}','${a.user_id}')">Approve</button>` : ''}
                    ${a.status === 'pending' ? `<button class="admin-action-btn danger" type="button" onclick="adminRejectIdentity('${a.id}','${a.user_id}')">Reject</button>` : ''}
                </div>
            `;
            return `
                <tr>
                    <td>${escapeHtml(p.display_name || 'User')} <span class="muted">${escapeHtml(p.tag || '')}</span></td>
                    <td>${escapeHtml(a.dob || '')}</td>
                    <td>${adminBadge(a.status)}</td>
                    <td>${escapeHtml(formatAdminDate(a.created_at))}</td>
                    <td>${actions}</td>
                </tr>
            `;
        })
        .join('');
}

async function adminOpenIdentityDocs(userId, frontPath, backPath) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const base = String(userId || '').trim();
    if (!base) return;

    const modalId = 'identityDocsPreviewModal';
    const frontImg = document.getElementById('identityDocFrontImg');
    const backImg = document.getElementById('identityDocBackImg');
    const frontLoading = document.getElementById('identityDocFrontLoading');
    const backLoading = document.getElementById('identityDocBackLoading');
    const frontError = document.getElementById('identityDocFrontError');
    const backError = document.getElementById('identityDocBackError');
    const frontOpen = document.getElementById('identityDocFrontOpen');
    const backOpen = document.getElementById('identityDocBackOpen');
    const frontDownload = document.getElementById('identityDocFrontDownload');
    const backDownload = document.getElementById('identityDocBackDownload');

    const resetSide = (img, loading, err, openEl, dlEl) => {
        if (img) {
            img.src = '';
            img.style.display = 'none';
            img.onclick = null;
        }
        if (loading) loading.style.display = 'block';
        if (err) {
            err.textContent = '';
            err.style.display = 'none';
        }
        if (openEl) openEl.style.display = 'none';
        if (dlEl) dlEl.style.display = 'none';
    };

    resetSide(frontImg, frontLoading, frontError, frontOpen, frontDownload);
    resetSide(backImg, backLoading, backError, backOpen, backDownload);
    openModal(modalId);
    scheduleLucideCreateIcons(document.getElementById(modalId));

    const loadOne = async (path, img, loading, err, openEl, dlEl, label) => {
        const p = String(path || '').trim();
        if (!p) {
            if (loading) loading.style.display = 'none';
            if (err) {
                err.textContent = 'No document uploaded.';
                err.style.display = 'block';
            }
            return;
        }
        const { data, error } = await client.storage.from(IDENTITY_DOCS_BUCKET).createSignedUrl(p, 300);
        if (loading) loading.style.display = 'none';
        if (error || !data?.signedUrl) {
            if (err) {
                err.textContent = String(error?.message || 'Document not accessible.');
                err.style.display = 'block';
            }
            return;
        }
        const url = data.signedUrl;
        if (img) {
            img.src = url;
            img.style.display = 'block';
            img.onclick = () => openLightbox(url);
        }
        if (openEl) {
            openEl.href = url;
            openEl.style.display = 'inline-flex';
        }
        if (dlEl) {
            dlEl.href = url;
            dlEl.download = `${base}_${label}.jpg`;
            dlEl.style.display = 'inline-flex';
        }
        scheduleLucideCreateIcons(document.getElementById(modalId));
    };

    await Promise.all([
        loadOne(frontPath, frontImg, frontLoading, frontError, frontOpen, frontDownload, 'front'),
        loadOne(backPath, backImg, backLoading, backError, backOpen, backDownload, 'back')
    ]);
}

function closeIdentityDocsPreviewModal() {
    closeModal('identityDocsPreviewModal');
    const ids = [
        'identityDocFrontImg',
        'identityDocBackImg',
        'identityDocFrontOpen',
        'identityDocBackOpen',
        'identityDocFrontDownload',
        'identityDocBackDownload'
    ];
    ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.tagName === 'IMG') {
            el.src = '';
            el.style.display = 'none';
        } else {
            el.style.display = 'none';
            el.removeAttribute('href');
        }
    });
    const loaders = ['identityDocFrontLoading', 'identityDocBackLoading'];
    loaders.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'block';
    });
    const errors = ['identityDocFrontError', 'identityDocBackError'];
    errors.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '';
            el.style.display = 'none';
        }
    });
}

async function adminApproveIdentity(appId, userId) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const { data, error } = await client.rpc('admin_approve_identity', { app_id: String(appId), referrals_required: REFERRALS_REQUIRED });
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    const granted = !!(data && typeof data === 'object' && data.granted_verified);
    showToast(granted ? 'Approved + Verified granted' : 'Approved', 'check-circle');
    renderIdentityApplications();
    renderAdminKpis();
}

async function adminRejectIdentity(appId, userId) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.rpc('admin_reject_identity', { app_id: String(appId) });
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    showToast('Rejected', 'check-circle');
    renderIdentityApplications();
    renderAdminKpis();
}

const adminSubmissionRowsCache = new Map();
const adminExpandedSubmissionIds = new Set();

function getSubmissionPayloadObject(submission) {
    return (submission && typeof submission.payload === 'object' && submission.payload) ? submission.payload : {};
}

function getSubmissionSummary(submission) {
    const payload = getSubmissionPayloadObject(submission);
    const message = String(payload.message || payload.msg || payload.text || '').trim();
    return message || JSON.stringify(payload || {}, null, 2) || '';
}

function getSubmissionDetailsText(submission) {
    const s = submission && typeof submission === 'object' ? submission : {};
    const payload = getSubmissionPayloadObject(s);
    const lines = [
        `Type: ${String(s.type || '—')}`,
        `Status: ${String(s.status || '—')}`,
        `Created: ${formatAdminDate(s.created_at)}`,
        `Email: ${String(payload.email || payload.mail || '—')}`,
        `Phone: ${String(payload.phone || payload.tel || '—')}`,
        '',
        'Message:',
        String(payload.message || payload.msg || payload.text || '—')
    ];
    const extraKeys = Object.keys(payload).filter((k) => !['email', 'mail', 'phone', 'tel', 'message', 'msg', 'text'].includes(String(k)));
    if (extraKeys.length) {
        lines.push('', 'Extra payload:', JSON.stringify(Object.fromEntries(extraKeys.map((k) => [k, payload[k]])), null, 2));
    }
    return lines.join('\n');
}

function adminToggleSubmissionDetails(submissionId) {
    const id = String(submissionId || '').trim();
    if (!id) return;
    if (adminExpandedSubmissionIds.has(id)) adminExpandedSubmissionIds.delete(id);
    else adminExpandedSubmissionIds.add(id);
    void renderSubmissions();
}

async function adminUpdateSubmissionStatus(submissionId, nextStatus) {
    const id = String(submissionId || '').trim();
    const status = String(nextStatus || '').trim().toLowerCase();
    if (!id || !status) return;
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const { data, error } = await client
        .from('submissions')
        .update({ status })
        .eq('id', id)
        .select('*')
        .maybeSingle();
    if (error || !data?.id) {
        showToast(error?.message || 'Failed to update submission', 'alert-circle');
        return;
    }
    adminSubmissionRowsCache.set(id, data);
    showToast(`Submission marked ${status}`, 'check-circle');
    await renderSubmissions();
    void renderAdminKpis();
}

async function renderSubmissions() {
    if (!isAdminAuthorized()) return;
    const tbody = document.getElementById('adminSubmissionsTbody');
    if (!tbody) return;
    const client = initSupabase();
    if (!client) return;
    const { data, error } = await client.from('submissions').select('*').order('created_at', { ascending: false }).limit(200);
    if (error) {
        tbody.innerHTML = '';
        if (!relationMissing(error, 'submissions')) showToast(error.message || 'Failed to load submissions', 'alert-circle');
        return;
    }
    adminSubmissionRowsCache.clear();
    (data || []).forEach((row) => {
        if (row?.id) adminSubmissionRowsCache.set(String(row.id), row);
    });
    const ids = (data || []).map((x) => x.user_id).filter(Boolean);
    const profiles = await fetchProfilesForAdmin(ids);
    tbody.innerHTML = (data || [])
        .map((s) => {
            const submissionId = String(s.id || '').trim();
            const p = s.user_id ? profiles[s.user_id] || {} : {};
            const userLabel = s.user_id ? `${escapeHtml(p.display_name || 'User')} ${p.tag ? `<span class="muted">${escapeHtml(p.tag)}</span>` : ''}` : '<span class="muted">Guest</span>';
            const payload = getSubmissionPayloadObject(s);
            const email = String(payload.email || payload.mail || '').trim();
            const phone = String(payload.phone || payload.tel || '').trim();
            const summary = getSubmissionSummary(s);
            const summaryShort = escapeHtml(summary).slice(0, 140);
            const extras = [email ? `Email: ${email}` : '', phone ? `Phone: ${phone}` : ''].filter(Boolean);
            const extrasHtml = extras.length ? `<div class="admin-details-meta">${escapeHtml(extras.join(' · '))}</div>` : '';
            const details = `<div class="admin-details"><div class="admin-details-main">${summaryShort}${summary.length > 140 ? '…' : ''}</div>${extrasHtml}</div>`;
            const expanded = submissionId && adminExpandedSubmissionIds.has(submissionId);
            const actions = `
                <div class="admin-actions">
                    <button class="admin-action-btn" type="button" onclick="adminToggleSubmissionDetails('${escapeHtml(submissionId)}')">${expanded ? 'Hide' : 'View'}</button>
                    ${String(s.status || '').toLowerCase() === 'pending'
                        ? `<button class="admin-action-btn primary" type="button" onclick="adminUpdateSubmissionStatus('${escapeHtml(submissionId)}','resolved')">Resolve</button>
                           <button class="admin-action-btn danger" type="button" onclick="adminUpdateSubmissionStatus('${escapeHtml(submissionId)}','rejected')">Reject</button>`
                        : `<button class="admin-action-btn" type="button" onclick="adminUpdateSubmissionStatus('${escapeHtml(submissionId)}','pending')">Reopen</button>`}
                </div>`;
            const expandedRow = expanded
                ? `<tr class="admin-submission-expanded-row">
                        <td colspan="6">
                            <pre class="admin-submission-full">${escapeHtml(getSubmissionDetailsText(s))}</pre>
                        </td>
                   </tr>`
                : '';
            return `
                <tr>
                    <td>${escapeHtml(s.type || '')}</td>
                    <td>${userLabel}</td>
                    <td>${escapeHtml(formatAdminDate(s.created_at))}</td>
                    <td>${adminBadge(s.status)}</td>
                    <td>${details}</td>
                    <td>${actions}</td>
                </tr>
                ${expandedRow}
            `;
        })
        .join('');
}

function flattenPresenceState(state) {
    const entries = [];
    Object.keys(state || {}).forEach((k) => {
        const arr = state[k] || [];
        arr.forEach((p) => entries.push({ key: k, ...p }));
    });
    return entries;
}

async function renderAdminLiveVisitors() {
    if (!isAdminAuthorized()) return;
    const el = document.getElementById('adminLiveList');
    if (!el) return;
    if (!livePresenceChannel) {
        el.innerHTML = '<div class="muted">Realtime not connected.</div>';
        return;
    }
    const state = livePresenceChannel.presenceState?.() || {};
    const entries = flattenPresenceState(state).sort((a, b) => String(b.last_seen || '').localeCompare(String(a.last_seen || '')));
    const seen = new Set();
    const uniqueEntries = entries.filter((v) => {
        const k = v.user_id ? `u:${v.user_id}` : `a:${v.key || ''}`;
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
    });
    if (!uniqueEntries.length) {
        el.innerHTML = '<div class="muted">No active visitors.</div>';
        return;
    }
    const userIds = Array.from(new Set(uniqueEntries.map((v) => v.user_id).filter(Boolean)));
    const profiles = await fetchProfilesForAdmin(userIds);
    el.innerHTML = uniqueEntries
        .slice(0, 80)
        .map((v) => {
            const id = v.user_id ? String(v.user_id).slice(0, 8) : String(v.key || '').slice(0, 8);
            const profile = v.user_id ? (profiles[v.user_id] || null) : null;
            const label = v.user_id
                ? `${escapeHtml(profile?.display_name || 'User')} <span class="meta">${escapeHtml(profile?.tag || '')}</span>`
                : `anon:${escapeHtml(id)}`;
            const deviceType = escapeHtml(String(v?.device?.type || ''));
            const deviceScreen = escapeHtml(String(v?.device?.screen || ''));
            const deviceLang = escapeHtml(String(v?.device?.lang || ''));
            const deviceLine = [deviceType, deviceScreen, deviceLang].filter(Boolean).join(' · ');
            const section = escapeHtml(v.section || '');
            const seen = escapeHtml(formatAdminDate(v.last_seen));
            return `
                <div class="admin-list-item">
                    <div>
                        <div style="font-weight:800;">${label}</div>
                        <div class="meta">${section}${deviceLine ? ` · ${deviceLine}` : ''}</div>
                    </div>
                    <div class="meta">${seen}</div>
                </div>
            `;
        })
        .join('');
}

async function adminFetchSignupMetrics(days = 30) {
    if (DEMO_MODE) {
        const today = new Date();
        const series = [];
        let running = 1200;
        for (let i = Math.max(1, Number(days) || 30) - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const v = Math.max(0, Math.round(10 + 6 * Math.sin(i / 2) + (Math.random() * 6 - 3)));
            running += v;
            series.push({ date: d.toISOString().slice(0, 10), count: v, total: running });
        }
        return { series, total: running };
    }
    const dayCount = Math.max(1, Math.min(180, Number(days) || 30));
    const client = initSupabase();
    if (!client) return null;
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData?.session?.access_token || '';

    try {
        const { data, error } = await client.rpc('admin_signup_metrics', { days: dayCount });
        if (!error && data && Array.isArray(data.series)) {
            return {
                total: Number(data.total) || 0,
                series: data.series.map((x) => ({
                    date: String(x?.date || ''),
                    count: Number(x?.count) || 0,
                    total: Number(x?.total) || 0
                }))
            };
        }
    } catch (e) {
        null;
    }

    const today = new Date();
    const start = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    start.setUTCDate(start.getUTCDate() - (dayCount - 1));
    const startIso = start.toISOString();

    const buildSeriesFromRows = (rows) => {
        const map = {};
        for (let i = 0; i < dayCount; i++) {
            const d = new Date(start);
            d.setUTCDate(start.getUTCDate() + i);
            map[d.toISOString().slice(0, 10)] = 0;
        }
        (Array.isArray(rows) ? rows : []).forEach((r) => {
            const ts = r?.created_at ? String(r.created_at) : '';
            if (!ts) return;
            const d = new Date(ts);
            if (Number.isNaN(d.getTime())) return;
            const key = d.toISOString().slice(0, 10);
            if (!(key in map)) return;
            map[key] = (Number(map[key]) || 0) + 1;
        });
        return Object.keys(map)
            .sort()
            .map((date) => ({ date, count: Number(map[date]) || 0 }));
    };

    try {
        if (token && SUPABASE_PROJECT_URL) {
            const res = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/admin-signup-metrics`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    apikey: SUPABASE_ANON_KEY,
                    authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ days: dayCount })
            });
            if (res.ok) {
                const payload = await res.json();
                if (payload && Array.isArray(payload.series)) {
                    let series = payload.series.map((x) => ({
                        date: String(x?.date || ''),
                        count: Number(x?.count) || 0,
                        total: Number(x?.total) || 0
                    }));
                    return {
                        total: Number(payload.total) || 0,
                        series: (() => {
                            const total = Number(payload.total) || 0;
                            const hasTotals = series.some((x) => Number(x.total) > 0);
                            if (hasTotals) return series;
                            const sum = series.reduce((acc, x) => acc + (Number(x.count) || 0), 0);
                            let running = Math.max(0, total - sum);
                            series = series.map((p) => {
                                running += Number(p.count) || 0;
                                return { ...p, total: running };
                            });
                            return series;
                        })()
                    };
                }
            }
        }
    } catch (e) {
        null;
    }

    try {
        const totalRes = await adminCount('profiles');
        const total = totalRes.error ? 0 : totalRes.count;
        const { data, error } = await client
            .from('profiles')
            .select('created_at')
            .gte('created_at', startIso)
            .order('created_at', { ascending: true })
            .limit(100000);
        if (error) return null;
        const seriesRaw = buildSeriesFromRows(data || []);
        const sum = seriesRaw.reduce((acc, x) => acc + (Number(x.count) || 0), 0);
        let running = Math.max(0, total - sum);
        const series = seriesRaw.map((p) => {
            running += Number(p.count) || 0;
            return { ...p, total: running };
        });
        return { total, series };
    } catch (e) {
        return null;
    }
}

function renderAdminGrowthChartSvg(series) {
    const width = 900;
    const height = 260;
    const padX = 34;
    const padY = 26;
    const w = width - padX * 2;
    const h = height - padY * 2;
    const points = Array.isArray(series) ? series.slice() : [];
    if (!points.length) return '';
    const maxVal = Math.max(1, ...points.map((x) => Number(x.count) || 0));
    const step = points.length <= 1 ? 0 : w / (points.length - 1);
    const coords = points.map((p, idx) => {
        const x = padX + idx * step;
        const y = padY + (1 - (Number(p.count) || 0) / maxVal) * h;
        return { x, y };
    });
    const path = coords
        .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
        .join(' ');
    const area = `${path} L${(padX + w).toFixed(2)} ${(padY + h).toFixed(2)} L${padX.toFixed(2)} ${(padY + h).toFixed(2)} Z`;
    const last = points[points.length - 1];
    const lastLabel = last?.date ? String(last.date).slice(5) : '';
    const first = points[0];
    const firstLabel = first?.date ? String(first.date).slice(5) : '';
    return `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Users growth">
            <defs>
                <linearGradient id="adminGrowthFill" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.22"></stop>
                    <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0"></stop>
                </linearGradient>
            </defs>
            <path d="${area}" fill="url(#adminGrowthFill)"></path>
            <path d="${path}" fill="none" stroke="var(--primary-color)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
            <line id="adminGrowthHoverLine" x1="0" y1="${padY}" x2="0" y2="${padY + h}" stroke="var(--border-color)" stroke-width="2" stroke-dasharray="5 5" opacity="0"></line>
            <circle id="adminGrowthHoverDot" cx="0" cy="0" r="7" fill="var(--primary-color)" stroke="var(--bg-main)" stroke-width="3" opacity="0"></circle>
            <rect x="0" y="0" width="${width}" height="${height}" fill="transparent" style="pointer-events:all;"></rect>
            <text x="${padX}" y="${height - 10}" fill="var(--text-muted)" font-size="12" font-weight="700">${escapeHtml(firstLabel)}</text>
            <text x="${padX + w}" y="${height - 10}" fill="var(--text-muted)" font-size="12" font-weight="700" text-anchor="end">${escapeHtml(lastLabel)}</text>
        </svg>
    `.trim();
}

function setupAdminGrowthChartHover(containerEl, series) {
    const svg = containerEl?.querySelector?.('svg');
    if (!svg) return;
    const width = 900;
    const height = 260;
    const padX = 34;
    const padY = 26;
    const w = width - padX * 2;
    const h = height - padY * 2;
    const points = Array.isArray(series) ? series.slice() : [];
    if (!points.length) return;
    const maxVal = Math.max(1, ...points.map((x) => Number(x.count) || 0));
    const step = points.length <= 1 ? 0 : w / (points.length - 1);
    const lineEl = svg.querySelector('#adminGrowthHoverLine');
    const dotEl = svg.querySelector('#adminGrowthHoverDot');
    let tooltip = containerEl.querySelector('.admin-chart-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'admin-chart-tooltip';
        containerEl.appendChild(tooltip);
    }
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const hide = () => {
        if (lineEl) lineEl.setAttribute('opacity', '0');
        if (dotEl) dotEl.setAttribute('opacity', '0');
        tooltip.style.display = 'none';
    };
    const showAt = (evt) => {
        const rect = svg.getBoundingClientRect();
        const cx = evt.clientX;
        const cy = evt.clientY;
        const x = ((cx - rect.left) / rect.width) * width;
        const raw = step > 0 ? Math.round((x - padX) / step) : 0;
        const idx = clamp(raw, 0, points.length - 1);
        const p = points[idx] || {};
        const px = padX + idx * step;
        const py = padY + (1 - (Number(p.count) || 0) / maxVal) * h;
        if (lineEl) {
            lineEl.setAttribute('x1', px.toFixed(2));
            lineEl.setAttribute('x2', px.toFixed(2));
            lineEl.setAttribute('opacity', '1');
        }
        if (dotEl) {
            dotEl.setAttribute('cx', px.toFixed(2));
            dotEl.setAttribute('cy', py.toFixed(2));
            dotEl.setAttribute('opacity', '1');
        }
        const date = escapeHtml(String(p.date || ''));
        const count = Number(p.count) || 0;
        const total = Number(p.total) || 0;
        tooltip.innerHTML = `
            <div class="admin-chart-tooltip-title">${date}</div>
            <div class="admin-chart-tooltip-row"><span>New users</span><strong>+${escapeHtml(String(count))}</strong></div>
            <div class="admin-chart-tooltip-row"><span>Total users</span><strong>${escapeHtml(String(total))}</strong></div>
        `.trim();
        tooltip.style.display = 'block';
        const containerRect = containerEl.getBoundingClientRect();
        const mx = cx - containerRect.left;
        const my = cy - containerRect.top;
        const tw = tooltip.offsetWidth || 220;
        const th = tooltip.offsetHeight || 72;
        let left = mx + 14;
        let top = my - th - 14;
        left = clamp(left, 8, containerRect.width - tw - 8);
        top = clamp(top, 8, containerRect.height - th - 8);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    };
    hide();
    svg.addEventListener('mousemove', showAt);
    svg.addEventListener('mouseenter', showAt);
    svg.addEventListener('mouseleave', hide);
    svg.addEventListener('touchstart', (e) => {
        if (!e.touches?.length) return;
        showAt(e.touches[0]);
    }, { passive: true });
    svg.addEventListener('touchmove', (e) => {
        if (!e.touches?.length) return;
        showAt(e.touches[0]);
    }, { passive: true });
    svg.addEventListener('touchend', hide, { passive: true });
}

async function renderAdminGrowthChart() {
    if (!isAdminAuthorized()) return;
    const chartEl = document.getElementById('adminGrowthChart');
    const summaryEl = document.getElementById('adminGrowthSummary');
    if (!chartEl || !summaryEl) return;
    chartEl.innerHTML = '<div class="muted">Loading...</div>';
    summaryEl.textContent = '';
    const days = 30;
    const data = await adminFetchSignupMetrics(days);
    if (!data) {
        chartEl.innerHTML = '<div class="muted">Unable to load growth data.</div>';
        return;
    }
    const series = Array.isArray(data.series) ? data.series.slice() : [];
    const lastDays = series.reduce((sum, x) => sum + (Number(x.count) || 0), 0);
    summaryEl.textContent = `Last ${days} days: +${lastDays} · Total: ${Number(data.total) || 0}`;
    chartEl.innerHTML = renderAdminGrowthChartSvg(series) || '<div class="muted">No data.</div>';
    setupAdminGrowthChartHover(chartEl, series);
}

async function adminFetchListingsGrowth(days = 30) {
    if (DEMO_MODE) {
        const today = new Date();
        const series = [];
        let running = 2200;
        for (let i = Math.max(1, Number(days) || 30) - 1; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            const v = Math.max(0, Math.round(18 + 10 * Math.sin(i / 3) + (Math.random() * 10 - 5)));
            running += v;
            series.push({ date: d.toISOString().slice(0, 10), count: v, total: running });
        }
        return { series, total: running };
    }
    const dayCount = Math.max(1, Math.min(180, Number(days) || 30));
    const client = initSupabase();
    if (!client) return null;
    try {
        const { data, error } = await client.rpc('admin_listings_growth', { days: dayCount });
        if (error) return null;
        const rows = Array.isArray(data) ? data : [];
        const series = rows.map((r) => ({
            date: String(r?.day || '').slice(0, 10),
            count: Number(r?.new_listings) || 0,
            total: Number(r?.total_listings) || 0
        })).filter((x) => x.date);
        const lastTotal = series.length ? Number(series[series.length - 1].total) || 0 : 0;
        return { series, total: lastTotal };
    } catch (e) {
        return null;
    }
}

function renderAdminMetricChartSvg(series, { prefix = 'adminMetric', ariaLabel = '' } = {}) {
    const width = 900;
    const height = 260;
    const padX = 34;
    const padY = 26;
    const w = width - padX * 2;
    const h = height - padY * 2;
    const points = Array.isArray(series) ? series.slice() : [];
    if (!points.length) return '';
    const maxVal = Math.max(1, ...points.map((x) => Number(x.count) || 0));
    const step = points.length <= 1 ? 0 : w / (points.length - 1);
    const coords = points.map((p, idx) => {
        const x = padX + idx * step;
        const y = padY + (1 - (Number(p.count) || 0) / maxVal) * h;
        return { x, y };
    });
    const path = coords
        .map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)} ${c.y.toFixed(2)}`)
        .join(' ');
    const area = `${path} L${(padX + w).toFixed(2)} ${(padY + h).toFixed(2)} L${padX.toFixed(2)} ${(padY + h).toFixed(2)} Z`;
    const last = points[points.length - 1];
    const lastLabel = last?.date ? String(last.date).slice(5) : '';
    const first = points[0];
    const firstLabel = first?.date ? String(first.date).slice(5) : '';
    const safePrefix = String(prefix || 'adminMetric').replace(/[^a-zA-Z0-9_-]/g, '');
    const fillId = `${safePrefix}Fill`;
    const lineId = `${safePrefix}HoverLine`;
    const dotId = `${safePrefix}HoverDot`;
    return `
        <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(ariaLabel)}">
            <defs>
                <linearGradient id="${escapeHtml(fillId)}" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stop-color="var(--primary-color)" stop-opacity="0.22"></stop>
                    <stop offset="100%" stop-color="var(--primary-color)" stop-opacity="0"></stop>
                </linearGradient>
            </defs>
            <path d="${area}" fill="url(#${escapeHtml(fillId)})"></path>
            <path d="${path}" fill="none" stroke="var(--primary-color)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
            <line id="${escapeHtml(lineId)}" x1="0" y1="${padY}" x2="0" y2="${padY + h}" stroke="var(--border-color)" stroke-width="2" stroke-dasharray="5 5" opacity="0"></line>
            <circle id="${escapeHtml(dotId)}" cx="0" cy="0" r="7" fill="var(--primary-color)" stroke="var(--bg-main)" stroke-width="3" opacity="0"></circle>
            <rect x="0" y="0" width="${width}" height="${height}" fill="transparent" style="pointer-events:all;"></rect>
            <text x="${padX}" y="${height - 10}" fill="var(--text-muted)" font-size="12" font-weight="700">${escapeHtml(firstLabel)}</text>
            <text x="${padX + w}" y="${height - 10}" fill="var(--text-muted)" font-size="12" font-weight="700" text-anchor="end">${escapeHtml(lastLabel)}</text>
        </svg>
    `.trim();
}

function setupAdminMetricChartHover(containerEl, series, { prefix = 'adminMetric', rows = [], title = '' } = {}) {
    const svg = containerEl?.querySelector?.('svg');
    if (!svg) return;
    const width = 900;
    const height = 260;
    const padX = 34;
    const padY = 26;
    const w = width - padX * 2;
    const h = height - padY * 2;
    const points = Array.isArray(series) ? series.slice() : [];
    if (!points.length) return;
    const maxVal = Math.max(1, ...points.map((x) => Number(x.count) || 0));
    const step = points.length <= 1 ? 0 : w / (points.length - 1);
    const safePrefix = String(prefix || 'adminMetric').replace(/[^a-zA-Z0-9_-]/g, '');
    const lineEl = svg.querySelector(`#${safePrefix}HoverLine`);
    const dotEl = svg.querySelector(`#${safePrefix}HoverDot`);
    let tooltip = containerEl.querySelector('.admin-chart-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'admin-chart-tooltip';
        containerEl.appendChild(tooltip);
    }
    const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
    const hide = () => {
        if (lineEl) lineEl.setAttribute('opacity', '0');
        if (dotEl) dotEl.setAttribute('opacity', '0');
        tooltip.style.display = 'none';
    };
    const showAt = (evt) => {
        const rect = svg.getBoundingClientRect();
        const cx = evt.clientX;
        const cy = evt.clientY;
        const x = ((cx - rect.left) / rect.width) * width;
        const raw = step > 0 ? Math.round((x - padX) / step) : 0;
        const idx = clamp(raw, 0, points.length - 1);
        const p = points[idx] || {};
        const px = padX + idx * step;
        const py = padY + (1 - (Number(p.count) || 0) / maxVal) * h;
        if (lineEl) {
            lineEl.setAttribute('x1', px.toFixed(2));
            lineEl.setAttribute('x2', px.toFixed(2));
            lineEl.setAttribute('opacity', '1');
        }
        if (dotEl) {
            dotEl.setAttribute('cx', px.toFixed(2));
            dotEl.setAttribute('cy', py.toFixed(2));
            dotEl.setAttribute('opacity', '1');
        }
        const date = escapeHtml(String(p.date || ''));
        const titleLine = title ? `<div class="admin-chart-tooltip-title">${escapeHtml(String(title))} · ${date}</div>` : `<div class="admin-chart-tooltip-title">${date}</div>`;
        const rowsHtml = (Array.isArray(rows) ? rows : []).map((r) => {
            const label = escapeHtml(String(r?.label || ''));
            const value = typeof r?.value === 'function' ? r.value(p) : '';
            return `<div class="admin-chart-tooltip-row"><span>${label}</span><strong>${escapeHtml(String(value))}</strong></div>`;
        }).join('');
        tooltip.innerHTML = `${titleLine}${rowsHtml}`.trim();
        tooltip.style.display = 'block';
        const containerRect = containerEl.getBoundingClientRect();
        const mx = cx - containerRect.left;
        const my = cy - containerRect.top;
        const tw = tooltip.offsetWidth || 220;
        const th = tooltip.offsetHeight || 72;
        let left = mx + 14;
        let top = my - th - 14;
        left = clamp(left, 8, containerRect.width - tw - 8);
        top = clamp(top, 8, containerRect.height - th - 8);
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
    };
    hide();
    svg.addEventListener('mousemove', showAt);
    svg.addEventListener('mouseenter', showAt);
    svg.addEventListener('mouseleave', hide);
    svg.addEventListener('touchstart', (e) => {
        if (!e.touches?.length) return;
        showAt(e.touches[0]);
    }, { passive: true });
    svg.addEventListener('touchmove', (e) => {
        if (!e.touches?.length) return;
        showAt(e.touches[0]);
    }, { passive: true });
    svg.addEventListener('touchend', hide, { passive: true });
}

async function renderAdminListingsCharts() {
    if (!isAdminAuthorized()) return;
    const totalChartEl = document.getElementById('adminListingsTotalChart');
    const dailyChartEl = document.getElementById('adminListingsDailyChart');
    const totalSummaryEl = document.getElementById('adminListingsTotalSummary');
    const dailySummaryEl = document.getElementById('adminListingsDailySummary');
    if (!totalChartEl || !dailyChartEl || !totalSummaryEl || !dailySummaryEl) return;
    totalChartEl.innerHTML = '<div class="muted">Loading...</div>';
    dailyChartEl.innerHTML = '<div class="muted">Loading...</div>';
    totalSummaryEl.textContent = '';
    dailySummaryEl.textContent = '';
    const days = 30;
    const data = await adminFetchListingsGrowth(days);
    if (!data) {
        totalChartEl.innerHTML = '<div class="muted">Unable to load listings data.</div>';
        dailyChartEl.innerHTML = '<div class="muted">Unable to load listings data.</div>';
        return;
    }
    const raw = Array.isArray(data.series) ? data.series.slice() : [];
    const byDate = new Map(raw.map((x) => [String(x?.date || ''), { count: Number(x?.count) || 0, total: Number(x?.total) || 0 }]));
    const posted = raw.reduce((sum, x) => sum + (Number(x.count) || 0), 0);
    const total = Number(data.total) || 0;
    totalSummaryEl.textContent = `Total: ${total}`;
    dailySummaryEl.textContent = `Last ${days} days: +${posted}`;
    const dailySeries = raw.map((p) => ({ ...p, count: Number(p.count) || 0 }));
    const totalSeries = raw.map((p) => ({ ...p, count: Number(p.total) || 0 }));
    totalChartEl.innerHTML = renderAdminMetricChartSvg(totalSeries, { prefix: 'adminListingsTotal', ariaLabel: 'Total listings' }) || '<div class="muted">No data.</div>';
    dailyChartEl.innerHTML = renderAdminMetricChartSvg(dailySeries, { prefix: 'adminListingsDaily', ariaLabel: 'Listings posted' }) || '<div class="muted">No data.</div>';
    setupAdminMetricChartHover(totalChartEl, totalSeries, {
        prefix: 'adminListingsTotal',
        title: 'Total',
        rows: [
            { label: 'Total listings', value: (p) => String(Number(p.count) || 0) },
            { label: 'New listings', value: (p) => `+${String(Number(byDate.get(String(p.date || ''))?.count) || 0)}` }
        ]
    });
    setupAdminMetricChartHover(dailyChartEl, dailySeries, {
        prefix: 'adminListingsDaily',
        title: 'Posted',
        rows: [
            { label: 'New listings', value: (p) => `+${String(Number(p.count) || 0)}` },
            { label: 'Total listings', value: (p) => String(Number(byDate.get(String(p.date || ''))?.total) || 0) }
        ]
    });
}

async function renderAdminOverviewLists() {
    if (!isAdminAuthorized()) return;
    const pendingEl = document.getElementById('adminPendingList');
    const activityEl = document.getElementById('adminActivityList');
    if (!pendingEl || !activityEl) return;
    const client = initSupabase();
    if (!client) return;
    const vip = await client.from('vip_applications').select('id, created_at, user_id, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(5);
    const verified = await client.from('verified_applications').select('id, created_at, user_id, status').eq('status', 'pending').order('created_at', { ascending: false }).limit(5);
    const ids = []
        .concat((vip.data || []).map((x) => x.user_id))
        .concat((verified.data || []).map((x) => x.user_id))
        .filter(Boolean);
    const profiles = await fetchProfilesForAdmin(ids);
    const pendingItems = []
        .concat((vip.data || []).map((x) => ({ kind: 'VIP', ...x })))
        .concat((verified.data || []).map((x) => ({ kind: 'Verified', ...x })))
        .sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')))
        .slice(0, 8);
    pendingEl.innerHTML = pendingItems.length
        ? pendingItems
              .map((x) => {
                  const p = profiles[x.user_id] || {};
                  return `
                    <div class="admin-list-item">
                        <div>
                            <div style="font-weight:800;">${escapeHtml(x.kind)} · ${escapeHtml(p.display_name || 'User')} <span class="meta">${escapeHtml(p.tag || '')}</span></div>
                            <div class="meta">${escapeHtml(formatAdminDate(x.created_at))}</div>
                        </div>
                        <button class="admin-action-btn" type="button" onclick="switchAdminTab('${x.kind === 'VIP' ? 'vip' : 'verified'}')">Open</button>
                    </div>
                `;
              })
              .join('')
        : '<div class="muted">No pending items.</div>';
    activityEl.innerHTML = '<div class="muted">Use notifications/messages inbox for realtime activity.</div>';
}

async function renderAdminFeatureFlags() {
    if (!isAdminAuthorized()) return;
    const coursesToggle = document.getElementById('adminCoursesFeatureToggle');
    const coursesHint = document.getElementById('adminCoursesFeatureHint');
    const liveToggle = document.getElementById('adminLiveSocialShoppingFeatureToggle');
    const liveHint = document.getElementById('adminLiveSocialShoppingFeatureHint');
    if (!coursesToggle && !liveToggle) return;
    await Promise.all([
        refreshCoursesFeatureFlag({ silent: true }),
        refreshLiveSocialShoppingFeatureFlag({ silent: true })
    ]);
    if (coursesToggle) coursesToggle.checked = !!coursesFeatureEnabledFlag;
    if (coursesHint) {
        coursesHint.textContent = coursesFeatureEnabledFlag
            ? 'Courses are visible to everyone.'
            : 'Courses are hidden for all users (admins can still access).';
    }
    if (liveToggle) liveToggle.checked = !!liveSocialShoppingFeatureEnabledFlag;
    if (liveHint) {
        liveHint.textContent = liveSocialShoppingFeatureEnabledFlag
            ? 'Live Social Shopping is visible to everyone.'
            : 'Live Social Shopping is hidden for normal users (admins can still access it).';
    }
    if (coursesToggle && !coursesToggle.dataset.bound) {
        coursesToggle.dataset.bound = '1';
        coursesToggle.addEventListener('change', async () => {
            const next = !!coursesToggle.checked;
            try {
                await saveFeatureFlagState('courses_enabled', next);
            } catch (error) {
                showToast(error?.message || 'Failed to update feature flag', 'alert-circle');
                await refreshCoursesFeatureFlag({ silent: true });
                coursesToggle.checked = !!coursesFeatureEnabledFlag;
                return;
            }
            await refreshCoursesFeatureFlag({ silent: true });
            showToast(next ? 'Courses enabled' : 'Courses hidden', 'check-circle');
        });
    }
    if (liveToggle && !liveToggle.dataset.bound) {
        liveToggle.dataset.bound = '1';
        liveToggle.addEventListener('change', async () => {
            const next = !!liveToggle.checked;
            try {
                await saveFeatureFlagState('live_social_shopping_enabled', next);
            } catch (error) {
                showToast(error?.message || 'Failed to update feature flag', 'alert-circle');
                await refreshLiveSocialShoppingFeatureFlag({ silent: true });
                liveToggle.checked = !!liveSocialShoppingFeatureEnabledFlag;
                return;
            }
            await refreshLiveSocialShoppingFeatureFlag({ silent: true });
            renderLiveSocialShoppingSection();
            showToast(next ? 'Live Social Shopping enabled' : 'Live Social Shopping hidden', 'check-circle');
        });
    }
}

async function renderAdminDashboard(force = false) {
    if (!isAdminAuthorized()) {
        showSection('home-section');
        return;
    }
    if (!adminActiveTab) adminActiveTab = 'overview';
    setActiveAdminTab(adminActiveTab);
    await renderAdminKpis();
    if (adminActiveTab === 'overview') {
        await renderAdminFeatureFlags();
        await renderAdminOverviewLists();
        await renderAdminGrowthChart();
        await renderAdminListingsCharts();
    }
    if (adminActiveTab === 'users') await renderAdminUsers();
    if (adminActiveTab === 'vip') await renderVipApplications();
    if (adminActiveTab === 'verified') {
        await renderVerifiedApplications();
        await renderIdentityApplications();
    }
    if (adminActiveTab === 'moderation') await renderAdminModeration();
    if (adminActiveTab === 'submissions') await renderSubmissions();
    if (adminActiveTab === 'banners') await renderAdminHomeBanners();
    if (adminActiveTab === 'live') await renderAdminLiveVisitors();
    if (force) showToast('Updated', 'check-circle');
}

async function renderAdminModeration() {
    const el = document.getElementById('adminModerationList');
    if (!el) return;
    if (!isAdminAuthorized()) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-muted); grid-column: 1 / -1;"><i data-lucide="loader" style="width: 36px; height: 36px;"></i><div style="margin-top: 8px;">Loading…</div></div>`;
    try {
        scheduleLucideCreateIcons(el);
    } catch (e) {
        null;
    }
    const client = initSupabase();
    if (!client) {
        el.innerHTML = `<div class="muted" style="padding: 12px 4px; grid-column: 1 / -1;">Supabase is not configured.</div>`;
        return;
    }
    const { data, error } = await client
        .from('listings')
        .select('id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, is_approved, deleted_at, listing_images(url, thumbnail_url, sort_order)')
        .is('deleted_at', null)
        .eq('is_approved', false)
        .order('created_at', { ascending: false })
        .limit(30);
    if (error) {
        el.innerHTML = `<div class="muted" style="padding: 12px 4px; grid-column: 1 / -1;">${escapeHtml(error.message || 'Failed to load pending listings')}</div>`;
        return;
    }
    const rows = Array.isArray(data) ? data : [];
    if (!rows.length) {
        el.innerHTML = `<div class="muted" style="padding: 12px 4px; grid-column: 1 / -1;">No pending listings.</div>`;
        return;
    }
    const ownerIds = Array.from(new Set(rows.map((r) => r?.owner_id).filter(Boolean)));
    const profilesById = ownerIds.length ? await fetchProfilesByIds(ownerIds) : {};
    const mapped = rows.map((row) => mapSupabaseListingRow(row, profilesById));
    el.innerHTML = mapped.map((item) => createModerationCardHTML(item)).join('');
    initCarouselsInContainer(el);
    scheduleLucideCreateIcons();
}

let adminHomeBannersRows = [];

async function renderAdminHomeBanners(force = false) {
    const el = document.getElementById('adminHomeBannersList');
    if (!el) return;
    if (!isAdminAuthorized()) {
        el.innerHTML = '';
        return;
    }
    el.innerHTML = `<div class="muted" style="padding: 10px 2px;">Loading…</div>`;
    const raw = await fetchHomeBannersRaw({ force: true });
    if (raw.error) {
        el.innerHTML = `<div class="muted" style="padding: 10px 2px;">${escapeHtml(raw.error.message || 'Failed to load banners')}</div>`;
        return;
    }
    const rows = Array.isArray(raw.rows) ? raw.rows : [];
    adminHomeBannersRows = rows.slice();
    if (!rows.length) {
        el.innerHTML = `<div class="muted" style="padding: 10px 2px;">No banners.</div>`;
        return;
    }
    el.innerHTML = rows
        .map((b) => {
            const id = Number(b.id) || 0;
            const url = getHomeBannerPublicUrl(b.image_path);
            const safeUrl = url ? escapeHtml(url) : '';
            const link = escapeHtml(String(b.link_url || ''));
            const checked = b.is_active ? 'checked' : '';
            const order = Number.isFinite(Number(b.sort_order)) ? Number(b.sort_order) : 0;
            return `
                <div class="admin-banner-row" data-banner-id="${escapeHtml(String(id))}">
                    <div class="admin-banner-thumb">${safeUrl ? `<img src="${safeUrl}" alt="">` : ''}</div>
                    <div class="admin-banner-meta">
                        <input id="adminBannerLink_${id}" type="text" value="${link}" placeholder="https://example.com">
                        <div style="display:flex; gap: 10px; align-items:center; flex-wrap: wrap;">
                            <label class="toggle-modern">
                                <input class="toggle-input" type="checkbox" ${checked} onchange="adminSetHomeBannerActive(${id}, this.checked)">
                                <span class="toggle-switch"></span>
                            </label>
                            <div class="muted">Order: ${escapeHtml(String(order))}</div>
                            <input id="adminBannerReplace_${id}" type="file" accept="image/*" style="display:none" onchange="adminReplaceHomeBannerImage(${id})">
                            <button class="admin-action-btn" type="button" onclick="document.getElementById('adminBannerReplace_${id}').click()">Replace</button>
                        </div>
                    </div>
                    <div class="admin-banner-actions">
                        <button class="admin-action-btn" type="button" onclick="adminMoveHomeBanner(${id}, 'up')">Up</button>
                        <button class="admin-action-btn" type="button" onclick="adminMoveHomeBanner(${id}, 'down')">Down</button>
                        <button class="admin-action-btn primary" type="button" onclick="adminSaveHomeBanner(${id})">Save</button>
                        <button class="admin-action-btn danger" type="button" onclick="adminDeleteHomeBanner(${id})">Delete</button>
                    </div>
                </div>
            `;
        })
        .join('');
    scheduleLucideCreateIcons();
}

async function adminUploadHomeBannerFile(file) {
    const client = initSupabase();
    if (!client) throw new Error('Supabase is not configured');
    const f = file;
    if (!f) throw new Error('Missing file');
    const safe = safeStorageFilename(f.name || 'banner.png');
    const path = `banners/${Date.now()}_${safe}`;
    const { error } = await client.storage.from(HOME_BANNERS_BUCKET).upload(path, f, { upsert: false });
    if (error) throw error;
    return path;
}

async function adminCreateHomeBanner() {
    if (!isAdminAuthorized()) {
        showToast('Not authorized', 'alert-circle');
        return;
    }
    const fileInput = document.getElementById('adminNewBannerFile');
    const slotInput = document.getElementById('adminNewBannerSlot');
    const linkInput = document.getElementById('adminNewBannerLink');
    const activeInput = document.getElementById('adminNewBannerActive');
    const addBtn = document.getElementById('adminAddBannerBtn');
    const file = fileInput?.files?.[0] || null;
    if (!file) {
        showToast('Please select an image', 'alert-circle');
        return;
    }
    const link = safeExternalHttpUrl(linkInput?.value || '');
    const isActive = !!activeInput?.checked;
    const slot = String(slotInput?.value || 'main').trim().toLowerCase() === 'secondary' ? 'secondary' : 'main';
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    try {
        if (addBtn) {
            addBtn.disabled = true;
            addBtn.dataset.prevText = addBtn.textContent || '';
            addBtn.textContent = 'Uploading…';
        }
        const imagePath = await adminUploadHomeBannerFile(file);
        const maxOrder = adminHomeBannersRows.reduce((acc, b) => Math.max(acc, Number(b.sort_order) || 0), 0);
        const nextOrder = adminHomeBannersRows.length ? maxOrder + 10 : 0;
        const { error } = await client
            .from(HOME_BANNERS_TABLE)
            .insert([{ image_path: imagePath, link_url: link || null, is_active: isActive, sort_order: nextOrder, slot }]);
        if (error) {
            showToast(error.message || 'Failed to add banner', 'alert-circle');
            return;
        }
        if (fileInput) fileInput.value = '';
        if (slotInput) slotInput.value = 'main';
        if (linkInput) linkInput.value = '';
        if (activeInput) activeInput.checked = true;
        invalidateHomeHeroRenderCache();
        await renderAdminHomeBanners(true);
        void renderHomeHeroBanners({ force: true });
        showToast('Banner added', 'check-circle');
    } catch (e) {
        showToast(String(e?.message || 'Failed to add banner'), 'alert-circle');
    } finally {
        if (addBtn) {
            const prev = addBtn.dataset.prevText || '';
            addBtn.textContent = prev || 'Add banner';
            addBtn.disabled = false;
            addBtn.dataset.prevText = '';
        }
    }
}

async function adminSaveHomeBanner(id) {
    if (!isAdminAuthorized()) return;
    const bannerId = Number(id) || 0;
    if (!bannerId) return;
    const linkInput = document.getElementById(`adminBannerLink_${bannerId}`);
    const link = safeExternalHttpUrl(linkInput?.value || '');
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.from(HOME_BANNERS_TABLE).update({ link_url: link || null }).eq('id', bannerId);
    if (error) {
        showToast(error.message || 'Failed to save', 'alert-circle');
        return;
    }
    invalidateHomeHeroRenderCache();
    void renderHomeHeroBanners({ force: true });
    showToast('Saved', 'check-circle');
}

async function adminSetHomeBannerActive(id, active) {
    if (!isAdminAuthorized()) return;
    const bannerId = Number(id) || 0;
    if (!bannerId) return;
    const client = initSupabase();
    if (!client) return;
    const { error } = await client.from(HOME_BANNERS_TABLE).update({ is_active: !!active }).eq('id', bannerId);
    if (error) {
        showToast(error.message || 'Failed to update', 'alert-circle');
        await renderAdminHomeBanners(true);
        return;
    }
    invalidateHomeHeroRenderCache();
    void renderHomeHeroBanners({ force: true });
}

async function adminReplaceHomeBannerImage(id) {
    if (!isAdminAuthorized()) return;
    const bannerId = Number(id) || 0;
    if (!bannerId) return;
    const fileInput = document.getElementById(`adminBannerReplace_${bannerId}`);
    const file = fileInput?.files?.[0] || null;
    if (!file) return;
    const client = initSupabase();
    if (!client) return;
    try {
        const imagePath = await adminUploadHomeBannerFile(file);
        const { error } = await client.from(HOME_BANNERS_TABLE).update({ image_path: imagePath }).eq('id', bannerId);
        if (error) {
            showToast(error.message || 'Failed to replace image', 'alert-circle');
            return;
        }
        if (fileInput) fileInput.value = '';
        invalidateHomeHeroRenderCache();
        await renderAdminHomeBanners(true);
        void renderHomeHeroBanners({ force: true });
        showToast('Image replaced', 'check-circle');
    } catch (e) {
        showToast(String(e?.message || 'Failed to replace image'), 'alert-circle');
    }
}

async function adminMoveHomeBanner(id, dir) {
    if (!isAdminAuthorized()) return;
    const bannerId = Number(id) || 0;
    if (!bannerId) return;
    const rows = adminHomeBannersRows.slice();
    const idx = rows.findIndex((b) => Number(b.id) === bannerId);
    if (idx < 0) return;
    const swapIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= rows.length) return;
    const a = rows[idx];
    const b = rows[swapIdx];
    const aOrder = Number(a.sort_order) || 0;
    const bOrder = Number(b.sort_order) || 0;
    const client = initSupabase();
    if (!client) return;
    const { error } = await client
        .from(HOME_BANNERS_TABLE)
        .upsert([{ id: a.id, sort_order: bOrder }, { id: b.id, sort_order: aOrder }], { onConflict: 'id' });
    if (error) {
        showToast(error.message || 'Failed to reorder', 'alert-circle');
        return;
    }
    invalidateHomeHeroRenderCache();
    await renderAdminHomeBanners(true);
    void renderHomeHeroBanners({ force: true });
}

function adminDeleteHomeBanner(id) {
    if (!isAdminAuthorized()) return;
    const bannerId = Number(id) || 0;
    if (!bannerId) return;
    showConfirmModal('Delete banner', 'This will remove the banner from the slider.', async () => {
        const y = window.scrollY || window.pageYOffset || 0;
        const client = initSupabase();
        if (!client) return;
        const { error } = await client.from(HOME_BANNERS_TABLE).delete().eq('id', bannerId);
        if (error) {
            showToast(error.message || 'Failed to delete', 'alert-circle');
            return;
        }
        invalidateHomeHeroRenderCache();
        await renderAdminHomeBanners(true);
        void renderHomeHeroBanners({ force: true });
        window.scrollTo(0, y);
        showToast('Deleted', 'check-circle');
    }, true, 'Delete', 'Cancel');
}

let adminModerationTopUpRunning = false;

function removeAdminModerationCard(listingId) {
    const id = String(listingId || '').trim();
    if (!id) return;
    const el = document.querySelector(`[data-moderation-id="${id}"]`);
    if (el) el.remove();
}

function pruneListingFromArray(items, listingId) {
    const id = Number(listingId) || 0;
    if (!id || !Array.isArray(items)) return Array.isArray(items) ? items : [];
    return items.filter((item) => Number(item?.id) !== id);
}

function removeDeletedListingFromUiState(listingId) {
    const id = Number(listingId) || 0;
    if (!id) return;
    listings = pruneListingFromArray(listings, id);
    myListings = pruneListingFromArray(myListings, id);
    vipVideoListings = pruneListingFromArray(vipVideoListings, id);
    vipVerifiedHomeListings = pruneListingFromArray(vipVerifiedHomeListings, id);
    vipVerifiedPageListings = pruneListingFromArray(vipVerifiedPageListings, id);
    favorites = Array.isArray(favorites) ? favorites.filter((fid) => Number(fid) !== id) : [];
    pendingHeartPulses.delete(id);
    listingReviewsCache.delete(id);
    listingSimilarCache.delete(id);
    delete listingDetailImageIndex[id];
    delete listingReviewPanelState[id];
    sellerProfileListingsCache.forEach((items, ownerId) => {
        if (!Array.isArray(items)) return;
        sellerProfileListingsCache.set(ownerId, pruneListingFromArray(items, id));
    });
    listingSimilarCache.forEach((items, key) => {
        if (!Array.isArray(items)) return;
        listingSimilarCache.set(key, pruneListingFromArray(items, id));
    });
    clearCardHtmlCache();
}

function reflectDeletedListingInUi(listingId) {
    const id = Number(listingId) || 0;
    if (!id) return;
    removeDeletedListingFromUiState(id);
    const active = getActiveSectionId();
    if (active === 'home-section') {
        renderListings();
    } else if (active === 'favorites-section') {
        renderFavorites();
    } else if (active === 'profile-section') {
        renderMyListings();
    } else if (active === 'vip-verified-listings-section') {
        renderVipVerifiedListingsPage();
    } else if (active === 'seller-profile-section') {
        const tag = String(currentSellerProfileTag || '').trim();
        if (tag) {
            void openSellerProfile(tag, 'listings', { pushState: false });
        }
    } else if (active === 'listing-detail-section') {
        if (currentListingDetailId === id) {
            currentListingDetailId = null;
            navigateBackFromListingFlow();
            return;
        }
        if (currentListingDetailId) void hydrateSimilarListingsForListingDetail(currentListingDetailId);
    }
}

async function topUpAdminModerationGrid() {
    if (adminModerationTopUpRunning) return;
    const el = document.getElementById('adminModerationList');
    if (!el) return;
    if (!isAdminAuthorized()) return;
    const existingIds = Array.from(el.querySelectorAll('[data-moderation-id]'))
        .map((node) => Number(node.getAttribute('data-moderation-id')))
        .filter((n) => Number.isFinite(n) && n > 0);
    const currentCount = existingIds.length;
    const missing = Math.max(0, 30 - currentCount);
    if (!missing) return;
    const client = initSupabase();
    if (!client) return;
    adminModerationTopUpRunning = true;
    try {
        let q = client
            .from('listings')
            .select('id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, is_approved, deleted_at, listing_images(url, thumbnail_url, sort_order)')
            .is('deleted_at', null)
            .eq('is_approved', false)
            .order('created_at', { ascending: false })
            .limit(missing);
        if (existingIds.length) q = q.not('id', 'in', `(${existingIds.join(',')})`);
        const { data, error } = await q;
        if (error) return;
        const rows = Array.isArray(data) ? data : [];
        if (!rows.length) return;
        const ownerIds = Array.from(new Set(rows.map((r) => r?.owner_id).filter(Boolean)));
        const profilesById = ownerIds.length ? await fetchProfilesByIds(ownerIds) : {};
        const mapped = rows.map((row) => mapSupabaseListingRow(row, profilesById));
        el.insertAdjacentHTML('beforeend', mapped.map((item) => createModerationCardHTML(item)).join(''));
        initCarouselsInContainer(el);
        scheduleLucideCreateIcons();
    } finally {
        adminModerationTopUpRunning = false;
    }
}

function createModerationCardHTML(item) {
    const carouselImages = getListingImagesForCard(item).slice(0, 8);
    const videoBadge = hasListingVideo(item) ? `<span class="video-play-badge"><i data-lucide="play"></i></span>` : '';
    const mediaHTML = carouselImages.length > 1
        ? `<div class="card-media-wrap"><div class="card-carousel js-carousel" data-carousel="card" data-listing-id="${item.id}" data-index="0">
                <div class="carousel-viewport">
                    <div class="carousel-track">
                        ${carouselImages.map((u) => `<div class="carousel-slide"><img src="${u}" data-src="${u}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low" draggable="false"></div>`).join('')}
                    </div>
                </div>
                ${videoBadge}
                <div class="carousel-dots">
                    ${carouselImages.map((_, i) => `<button type="button" class="carousel-dot ${i === 0 ? 'active' : ''}" data-dot-index="${i}"></button>`).join('')}
                </div>
            </div></div>`
        : `<div class="card-media-wrap">${videoBadge}<img src="${item.cardImage || item.image}" data-src="${item.cardImage || item.image}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low"></div>`;
    const ownerName = String(item?.seller?.name || '').trim();
    const ownerTag = String(item?.seller?.tag || '').trim();
    const sellerLabel = [ownerName, ownerTag].filter(Boolean).join(' ') || '';
    return `
        <div class="card" data-moderation-id="${escapeHtml(String(item.id))}">
            ${mediaHTML}
            <div class="card-content">
                <div class="card-price">${(item.price_type === 'Free' || Number(item.price) === 0) ? 'Free' : `${new Intl.NumberFormat('fr-DZ').format(item.price)} DZD`}</div>
                <div class="card-title">${escapeHtml(item.title || '')}</div>
                <div class="card-footer">
                    <span><i data-lucide="map-pin" style="width:12px"></i> ${escapeHtml(item.location || '')}</span>
                    <span>${escapeHtml(item.date || '')}</span>
                </div>
                ${sellerLabel ? `<div class="meta" style="margin-top: 8px;">${escapeHtml(sellerLabel)}</div>` : ''}
            </div>
            <div class="moderation-actions-row">
                <button class="moderation-btn reject" type="button" onclick="adminDeleteListing('${escapeHtml(String(item.id))}'); event.stopPropagation();">
                    <i data-lucide="x"></i>
                </button>
                <button class="moderation-btn approve" type="button" onclick="adminApproveListing('${escapeHtml(String(item.id))}'); event.stopPropagation();">
                    <i data-lucide="check"></i>
                </button>
            </div>
        </div>
    `;
}

async function adminApproveListing(listingId) {
    const id = String(listingId || '').trim();
    if (!id) return;
    if (!isAdminAuthorized()) {
        showToast('Not authorized', 'alert-circle');
        return;
    }
    const client = initSupabase();
    if (!client) {
        showToast('Supabase is not configured', 'alert-circle');
        return;
    }
    const { error } = await client
        .from('listings')
        .update({
            is_approved: true,
            approved_at: new Date().toISOString(),
            approved_by: currentSupabaseUserId || null
        })
        .eq('id', id);
    if (error) {
        showToast(error.message || 'Failed to approve listing', 'alert-circle');
        return;
    }
    showToast('Listing approved', 'check-circle');
    removeAdminModerationCard(id);
    try {
        fetchListingsFromSupabase({ silent: true });
    } catch (e) {
        null;
    }
    await topUpAdminModerationGrid();
}

function adminDeleteListing(listingId) {
    const id = String(listingId || '').trim();
    if (!id) return;
    if (!isAdminAuthorized()) {
        showToast('Not authorized', 'alert-circle');
        return;
    }
    showConfirmModal(
        'Delete listing',
        'Are you sure you want to delete this listing?',
        async () => {
            const client = initSupabase();
            if (!client) {
                showToast('Supabase is not configured', 'alert-circle');
                return;
            }
            const deletedAt = new Date().toISOString();
            const { data: updatedRow, error } = await client
                .from('listings')
                .update({ deleted_at: deletedAt })
                .eq('id', id)
                .is('deleted_at', null)
                .select('id, deleted_at')
                .maybeSingle();
            if (error) {
                showToast(error.message || 'Failed to delete listing', 'alert-circle');
                return;
            }
            if (!updatedRow?.id) {
                showToast('Delete failed: listing not found or already deleted', 'alert-circle');
                return;
            }
            reflectDeletedListingInUi(id);
            removeAdminModerationCard(id);
            showToast('Listing deleted', 'trash-2');
            try {
                void fetchListingsFromSupabase({ silent: true });
            } catch (e) {
                null;
            }
            await topUpAdminModerationGrid();
        },
        true
    );
}

async function showSection(sectionId) {
    if (sectionId === 'profile-section' && !isLoggedIn()) {
        setPendingSectionAfterAuth('profile-section');
        openModal('authGateModal');
        scheduleLucideCreateIcons(document.getElementById('authGateModal'));
        return;
    }
    if (sectionId === 'course-section' && !isCoursesFeatureEnabledForViewer()) {
        try {
            setCourseRouteParam('', { replace: true });
        } catch (e) {
            null;
        }
        showToast('Courses are temporarily unavailable', 'alert-circle');
        sectionId = 'home-section';
    }
    if (sectionId === 'live-social-shopping-section' && !isLiveSocialShoppingEnabledForViewer()) {
        showToast('Live Social Shopping is temporarily unavailable', 'alert-circle');
        sectionId = 'home-section';
    }
    if (sectionId !== 'course-section') {
        activeCourseId = null;
        activeCourseFromSection = 'profile-section';
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('course')) setCourseRouteParam('', { replace: true });
        } catch (e) {
            null;
        }
    }
    if (sectionId !== 'create-listing-section' && sectionId !== 'listing-detail-section') {
        clearListingRouteParams({ replace: true });
    }
    const protectedSections = ['profile-section', 'messages-section', 'favorites-section', 'settings-section', 'admin-dashboard-section'];
    if (protectedSections.includes(sectionId) && !requireAuthOrPrompt()) {
        sectionId = 'home-section';
    }
    if (sectionId === 'admin-dashboard-section' && !userProfile?.isAdmin) {
        sectionId = 'home-section';
    }
    stopAllActiveVideos();
    if (sectionId !== 'home-section') {
        stopHomeHeroAutoplay();
    }
    if (sectionId === 'admin-dashboard-section') {
        try {
            setSidebarMobileOpen(false);
        } catch (e) {
            null;
        }
        try {
            sidebar?.classList?.add?.('collapsed');
            contentArea?.classList?.add?.('expanded');
            document.documentElement.classList.add('sidebar-collapsed');
        } catch (e) {
            null;
        }
    }
    try {
        document.activeElement?.blur?.();
    } catch {}
    closeMobileSearchExpand();
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    try {
        document.documentElement.classList.toggle('listing-detail-view', sectionId === 'listing-detail-section');
        document.documentElement.classList.toggle('admin-dashboard-view', sectionId === 'admin-dashboard-section');
    } catch (e) {
        null;
    }
    endBootUI();
    setSidebarMobileOpen(false);
    const lockChatScroll = sectionId === 'messages-section' && window.innerWidth <= 900;
    window.scrollTo({ top: 0, behavior: lockChatScroll ? 'auto' : 'smooth' });
    syncMessagesScrollLock();

    // Save current section to localStorage
    if (sectionId !== 'listing-detail-section' && sectionId !== 'create-listing-section') {
        localStorage.setItem('winjayLastSection', sectionId);
    }
    try {
        const url = new URL(window.location.href);
        if (crawlableStaticSections.has(sectionId)) {
            url.searchParams.set('section', sectionId);
        } else {
            url.searchParams.delete('section');
        }
        if (sectionId !== 'vip-verified-listings-section') {
            url.searchParams.delete('vip_verified');
        }
        url.searchParams.delete('modal');
        const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');
        const prevState = history.state && typeof history.state === 'object' ? history.state : {};
        history.replaceState({ ...prevState, __winjay: true, sectionId, scrollY: 0 }, '', next);
    } catch (e) {
        null;
    }
    updateLivePresence();
    if (sectionId === 'home-section') {
        trackAnalyticsEvent('home_view', { dedupeKey: `home_view:${getAnalyticsSessionId()}` });
    }

    if (sectionId === 'home-section') {
        clearSellerProfileRouteTag();
        renderListings();
        void renderHomeHeroBanners();
        ensureHomeVipRowsHydrated({ silent: true, filters: currentFilters });
    } else if (sectionId === 'vip-verified-listings-section') {
        clearSellerProfileRouteTag();
        renderVipVerifiedListingsPage();
    } else if (sectionId === 'favorites-section') {
        clearSellerProfileRouteTag();
        renderFavorites();
    } else if (sectionId === 'profile-section') {
        clearSellerProfileRouteTag();
        startSectionLoadingSkeleton('profile-section');
        try {
            myListingsGrid.innerHTML = '<div class="empty-state"><i data-lucide="loader" style="animation: spin 1s linear infinite;"></i><h3>Chargement...</h3></div>';
            scheduleLucideCreateIcons(myListingsGrid);
            const loaded = await ensureMyProfileListingsLoaded();
            if (!loaded) {
                showToast('Failed to load your listings', 'alert-circle');
            }
            renderMyListings();
            renderMyProfileReviews();
            try {
                const savedTab = (localStorage.getItem(MY_PROFILE_LAST_TAB_STORAGE_KEY) || '').trim().toLowerCase();
                if (savedTab) void switchMyProfileSection(savedTab);
            } catch (e) {
                null;
            }
        } finally {
            stopSectionLoadingSkeleton();
        }
    } else if (sectionId === 'messages-section') {
        clearSellerProfileRouteTag();
        if (suppressNextMessagesBootstrap) {
            suppressNextMessagesBootstrap = false;
            renderMessagesList();
            renderEmptyChat();
        } else {
            startSectionLoadingSkeleton('messages-section');
            try {
                await bootstrapMessages();
            } finally {
                stopSectionLoadingSkeleton();
            }
        }
        scheduleSyncMessagesContainerHeight();
    } else if (sectionId === 'ambassadors-section') {
        clearSellerProfileRouteTag();
        startSectionLoadingSkeleton('ambassadors-section');
        try {
            await refreshAmbassadorsSection(false);
        } finally {
            stopSectionLoadingSkeleton();
        }
    } else if (sectionId === 'admin-dashboard-section') {
        clearSellerProfileRouteTag();
        startSectionLoadingSkeleton('admin-dashboard-section');
        try {
            await renderAdminDashboard();
        } finally {
            stopSectionLoadingSkeleton();
        }
    } else if (sectionId === 'live-social-shopping-section') {
        clearSellerProfileRouteTag();
        renderLiveSocialShoppingSection();
    } else if (sectionId === 'course-section') {
        clearSellerProfileRouteTag();
        startSectionLoadingSkeleton('course-section');
        try {
            await renderCourseSection();
        } finally {
            stopSectionLoadingSkeleton();
        }
    }
}

function getActiveSectionId() {
    const active = document.querySelector('.content-section.active');
    return active?.id || 'home-section';
}

function getSafeHistoryState() {
    const state = history.state && typeof history.state === 'object' ? history.state : {};
    return state && typeof state === 'object' ? state : {};
}

function snapshotCurrentViewToHistoryState() {
    const state = getSafeHistoryState();
    const sectionId = getActiveSectionId();
    const scrollY = window.scrollY || window.pageYOffset || 0;
    try {
        history.replaceState({ ...state, __winjay: true, sectionId, scrollY }, '', window.location.pathname + window.location.search);
    } catch (e) {
        null;
    }
}

function restoreScrollFromHistoryState({ fallback = 0 } = {}) {
    const state = getSafeHistoryState();
    const y = Number.isFinite(Number(state?.scrollY)) ? Number(state.scrollY) : Number(fallback) || 0;
    if (!Number.isFinite(y) || y < 0) return;
    const active = getActiveSectionId();
    if (active === 'listing-detail-section' || active === 'create-listing-section') return;
    try {
        window.scrollTo({ top: y, behavior: 'auto' });
    } catch (e) {
        window.scrollTo(0, y);
    }
}

async function navigateToSection(sectionId, { replace = false } = {}) {
    const id = String(sectionId || '').trim();
    if (!id) return;
    if (getActiveSectionId() === id) return;
    const from = getActiveSectionId();
    snapshotCurrentViewToHistoryState();
    await showSection(id);
    if (getActiveSectionId() !== id) return;
    const state = getSafeHistoryState();
    try {
        const nextState = { ...state, __winjay: true, view: 'section', sectionId: id, from, scrollY: 0 };
        const nextUrl = window.location.pathname + window.location.search;
        if (replace) history.replaceState(nextState, '', nextUrl);
        else history.pushState(nextState, '', nextUrl);
    } catch (e) {
        null;
    }
}

function navigateBackInApp(fallbackSectionId = 'home-section') {
    const state = getSafeHistoryState();
    if (state?.from) {
        try {
            history.back();
            return;
        } catch (e) {
            null;
        }
    }
    showSection(String(fallbackSectionId || '').trim() || 'home-section');
}

function clearListingRouteParams({ replace = true } = {}) {
    const url = new URL(window.location.href);
    const had = url.searchParams.has('listing') || url.searchParams.has('new') || url.searchParams.has('edit');
    url.searchParams.delete('listing');
    url.searchParams.delete('new');
    url.searchParams.delete('edit');
    if (!had) return;
    if (replace) {
        history.replaceState(history.state || null, '', url.pathname + url.search);
    } else {
        history.pushState(history.state || null, '', url.pathname + url.search);
    }
}

const crawlableStaticSections = new Set(['about-section', 'terms-section', 'privacy-section']);

function setCrawlableSectionRouteParam(sectionId, { replace = false } = {}) {
    const id = String(sectionId || '').trim();
    const url = new URL(window.location.href);
    url.searchParams.delete('profile');
    url.searchParams.delete('listing');
    url.searchParams.delete('new');
    url.searchParams.delete('edit');
    url.searchParams.delete('course');
    url.searchParams.delete('chat');
    url.searchParams.delete('modal');
    if (crawlableStaticSections.has(id)) url.searchParams.set('section', id);
    else url.searchParams.delete('section');
    const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');
    if (replace) history.replaceState(history.state || null, '', next);
    else history.pushState(history.state || null, '', next);
}

function setCrawlableModalRouteParam(modalKey, { replace = false } = {}) {
    const key = String(modalKey || '').trim();
    const url = new URL(window.location.href);
    url.searchParams.set('modal', key);
    const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');
    if (replace) history.replaceState(history.state || null, '', next);
    else history.pushState(history.state || null, '', next);
}

function handleCrawlableSectionLink(event, sectionId) {
    const e = event || null;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1)) return true;
    try {
        e?.preventDefault?.();
    } catch (err) {
        null;
    }
    setCrawlableSectionRouteParam(sectionId, { replace: false });
    showSection(sectionId);
    return false;
}

function handleCrawlableModalLink(event, modalId, modalKey) {
    const e = event || null;
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1)) return true;
    try {
        e?.preventDefault?.();
    } catch (err) {
        null;
    }
    setCrawlableModalRouteParam(modalKey, { replace: false });
    openModal(modalId);
    scheduleLucideCreateIcons(document.getElementById(modalId));
    return false;
}

function navigateBackFromSellerProfileFlow() {
    const state = history.state && typeof history.state === 'object' ? history.state : null;
    const from = state?.from ? String(state.from) : '';
    const fromListingId = Number(state?.fromListingId) || 0;
    if (from === 'listing-detail-section' && fromListingId > 0) {
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete('profile');
            url.searchParams.delete('new');
            url.searchParams.set('listing', String(fromListingId));
            history.replaceState({ __winjay: true, view: 'listing', listingId: fromListingId, from: 'seller-profile-section' }, '', url.pathname + url.search);
        } catch (e) {
            null;
        }
        openListingDetail(fromListingId, { pushState: false });
        return;
    }
    clearSellerProfileRouteTag();
    if (from === 'seller-profile-section') {
        showSection('home-section');
        return;
    }
    if (from && from !== 'seller-profile-section') {
        showSection(from === 'create-listing-section' ? 'home-section' : from);
        return;
    }
    const last = (localStorage.getItem('winjayLastSection') || '').trim() || 'home-section';
    showSection(last === 'listing-detail-section' || last === 'create-listing-section' || last === 'seller-profile-section' ? 'home-section' : last);
}

function navigateBackFromListingFlow() {
    if (createListingMode === 'create' && getActiveSectionId() === 'create-listing-section' && createListingStep === 'details') {
        setCreateListingStep('category');
        return;
    }
    if (createListingMode === 'edit') {
        editingListingId = null;
        createListingMode = 'create';
        try {
            setCreateListingPageMode('create');
            resetCreateListingDraft({ resetForm: true });
        } catch (e) {
            null;
        }
    }
    const state = history.state && typeof history.state === 'object' ? history.state : null;
    const from = state?.from ? String(state.from) : '';
    if (from) {
        history.back();
        return;
    }
    clearListingRouteParams({ replace: true });
    const last = (localStorage.getItem('winjayLastSection') || '').trim() || 'home-section';
    showSection(last === 'listing-detail-section' || last === 'create-listing-section' ? 'home-section' : last);
}

function setCreateListingPageMode(mode = 'create') {
    const section = document.getElementById('create-listing-section');
    if (!section) return;
    const h2 = section.querySelector('.page-card-head h2');
    const sub = section.querySelector('.page-card-head .muted');
    const submit = section.querySelector('#addListingForm button[type="submit"]');
    if (!h2 || !sub || !submit) return;
    if (!h2.dataset.defaultText) h2.dataset.defaultText = h2.textContent || '';
    if (!sub.dataset.defaultText) sub.dataset.defaultText = sub.textContent || '';
    if (!submit.dataset.defaultText) submit.dataset.defaultText = submit.textContent || '';
    const isEdit = String(mode || '').toLowerCase() === 'edit';
    h2.textContent = isEdit ? "Modifier une annonce" : (h2.dataset.defaultText || "Créer une annonce");
    sub.textContent = isEdit ? "Modifiez les détails et mettez à jour les photos" : (sub.dataset.defaultText || "Remplissez les détails et ajoutez des photos");
    submit.textContent = isEdit ? "Enregistrer" : (submit.dataset.defaultText || "Publier l'annonce");
}

function openEditListingPage(event, id) {
    try {
        event?.preventDefault?.();
        event?.stopPropagation?.();
    } catch (e) {
        null;
    }
    openEditListingPageById(id, { pushState: true });
}

function openEditListingPageById(id, { pushState = true } = {}) {
    const listingId = Number(id);
    const item = listings.find((l) => l.id === listingId);
    if (!item) return;
    editingListingId = listingId;
    createListingMode = 'edit';
    bindCreateListingStepFlow();
    setCreateListingStep('details');
    setCreateListingPageMode('edit');
    if (pushState) {
        const from = getActiveSectionId();
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete('listing');
            url.searchParams.delete('new');
            url.searchParams.delete('profile');
            url.searchParams.set('edit', String(listingId));
            history.pushState({ __winjay: true, view: 'edit', editId: listingId, from }, '', url.pathname + url.search);
        } catch (e) {
            null;
        }
    }
    resetCreateListingDraft({ resetForm: false });
    updateListingVideoGroupVisibility();
    const titleEl = document.getElementById('listingTitle');
    if (titleEl) titleEl.value = item.title || '';
    const descEl = document.getElementById('listingDescription');
    if (descEl) descEl.value = item.description || '';
    const conditionEl = document.getElementById('listingCondition');
    if (conditionEl) conditionEl.value = item.condition || '';
    const priceTypeEl = document.getElementById('listingPriceType');
    if (priceTypeEl) priceTypeEl.value = item.price_type || '';
    const priceEl = document.getElementById('listingPrice');
    if (priceEl) priceEl.value = String(Number(item.price) || 0);
    const categoryEl = document.getElementById('listingCategory');
    if (categoryEl) categoryEl.value = item.category || '';
    const subEl = document.getElementById('listingSubcategory');
    populateListingSubcategorySelect(subEl, item.category || '', item.subcategory || '');
    try {
        renderListingDynamicFields(item.details || {});
    } catch (e) {
        null;
    }
    const wilayaEl = document.getElementById('listingWilaya');
    if (wilayaEl) wilayaEl.value = item.wilaya || '';
    const cityEl = document.getElementById('listingCity');
    populateCitySelect(cityEl, item.wilaya || '', item.city || '');
    const deliveryEl = document.getElementById('listingDelivery');
    if (deliveryEl) deliveryEl.value = item.delivery || '';
    const phoneEl = document.getElementById('listingContactPhone');
    if (phoneEl) phoneEl.value = item.contact_phone || '';
    const availEl = document.getElementById('listingAvailability');
    if (availEl) availEl.value = item.availability || 'Available';
    const tagsEl = document.getElementById('listingTags');
    if (tagsEl) tagsEl.value = Array.isArray(item.tags) ? item.tags.join(', ') : '';
    if (priceTypeEl && priceEl) {
        priceEl.disabled = priceTypeEl.value === 'Free';
        if (priceTypeEl.value === 'Free') priceEl.value = '0';
    }
    selectedListingImages = Array.from({ length: MAX_LISTING_IMAGES }, () => null);
    selectedListingImageUrls = Array.from({ length: MAX_LISTING_IMAGES }, () => '');
    selectedListingImageSources = Array.from({ length: MAX_LISTING_IMAGES }, () => '');
    const existing = Array.isArray(item.images) ? item.images.filter(Boolean) : [];
    existing.slice(0, MAX_LISTING_IMAGES).forEach((u, i) => {
        selectedListingImageUrls[i] = u;
        selectedListingImageSources[i] = 'existing';
    });
    renderListingImagesSlots();
    updateListingImagesMiniPreview();
    showSection('create-listing-section');
    try {
        setupSelectPickers();
    } catch (e) {
        null;
    }
    scheduleLucideCreateIcons(document.getElementById('create-listing-section') || document.body);
}

function openCreateListingPage({ pushState = true } = {}) {
    if (!requireAuthOrPrompt()) return;
    if (isAutoGeneratedTag(userProfile?.tag)) {
        showToast('Set your username before posting listings', 'alert-circle');
        openModal('editProfileModal');
        return;
    }
    editingListingId = null;
    createListingMode = 'create';
    bindCreateListingStepFlow();
    try {
        setCreateListingPageMode('create');
    } catch (e) {
        null;
    }
    const from = getActiveSectionId();
    if (pushState) {
        const url = new URL(window.location.href);
        url.searchParams.delete('listing');
        url.searchParams.set('new', '1');
        history.pushState({ __winjay: true, view: 'new', from }, '', url.pathname + url.search);
    }
    resetCreateListingDraft({ resetForm: true });
    showSection('create-listing-section');
    updateListingVideoGroupVisibility();
    try {
        renderListingImagesSlots();
    } catch (e) {
        null;
    }
    const phoneInput = document.getElementById('listingContactPhone');
    if (phoneInput && !phoneInput.value && userProfile?.phone) {
        phoneInput.value = userProfile.phone;
    }
    
    const isPro = userProfile?.businessType === 'Professionnel';
    const hasAutoFilled = autoFillCategoryFromProfile();
    
    try {
        setupSelectPickers();
    } catch (e) {
        null;
    }
    
    if (isPro && hasAutoFilled) {
        setCreateListingStep('details');
    } else {
        setCreateListingStep('category');
    }
    
    scheduleLucideCreateIcons(document.getElementById('create-listing-section') || document.body);
}

function normalizeText(str) {
    return String(str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function autoFillCategoryFromProfile() {
    const isPro = userProfile?.businessType === 'Professionnel';
    const workCatId = userProfile?.workCategoryId ? String(userProfile.workCategoryId) : '';
    const workCat = userProfile?.workCategory || '';
    const normalizedCat = normalizeText(workCat);

    // 1. Try to find the parent category directly from listingSubcategoriesByCategory
    let foundCategory = null;
    let exactSubcategory = null;

    if (isPro && workCatId && businessCategoriesById?.[workCatId]) {
        const row = businessCategoriesById[workCatId];
        const cat = String(row.listing_category || '').trim();
        const sub = String(row.listing_subcategory || '').trim();
        if (cat && sub) {
            foundCategory = cat;
            exactSubcategory = sub;
        }
    }

    for (const [cat, subs] of Object.entries(listingSubcategoriesByCategory)) {
        if (foundCategory) break;
        const match = subs.find(s => normalizeText(s) === normalizedCat);
        if (!match) continue;
        foundCategory = cat;
        exactSubcategory = match;
        break;
    }

    // 2. Fallback to WORK_CATEGORY_TO_LISTING for legacy/custom mappings
    if (!foundCategory) {
        if (!workCat) return false;
        let mapping = WORK_CATEGORY_TO_LISTING[workCat];
        if (!mapping) {
            for (const [key, value] of Object.entries(WORK_CATEGORY_TO_LISTING)) {
                if (normalizeText(key) === normalizedCat) {
                    mapping = value;
                    break;
                }
            }
        }
        if (mapping) {
            foundCategory = mapping.category;
            exactSubcategory = mapping.subcategory;
        }
    }

    if (!foundCategory || !exactSubcategory) return false;

    const catSelect = document.getElementById('listingCategory');
    const subSelect = document.getElementById('listingSubcategory');
    if (!catSelect || !subSelect) return false;

    catSelect.value = foundCategory;
    // Pre-populate subcategory list
    populateListingSubcategorySelect(subSelect, foundCategory, exactSubcategory);

    catSelect.dispatchEvent(new Event('change'));
    subSelect.value = exactSubcategory;
    subSelect.dispatchEvent(new Event('change'));

    toggleHotelFieldsVisibility();
    return true;
}

function handleListingRoutesFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const state = history.state && typeof history.state === 'object' ? history.state : null;
    if (params.get('chat') === '1' || state?.view === 'messages') {
        showSection('messages-section');
        return;
    }
    const courseParam = params.get('course');
    if (courseParam) {
        const id = String(courseParam || '').trim();
        if (id) {
            if (state?.view !== 'course' || String(state?.courseId || '') !== id) {
                try {
                    history.replaceState(
                        { __winjay: true, view: 'course', courseId: id, from: String(activeCourseFromSection || '').trim() || 'profile-section' },
                        '',
                        window.location.pathname + window.location.search
                    );
                } catch (e) {
                    null;
                }
            }
            activeCourseId = id;
            if (state?.view === 'course' && state?.from) {
                activeCourseFromSection = String(state.from || '').trim() || activeCourseFromSection;
            }
            showSection('course-section');
            return;
        }
    }
    const profileParam = params.get('profile');
    if (profileParam) {
        const tag = profileParam.startsWith('@') ? profileParam : '@' + profileParam;
        showSection('seller-profile-section');
        const content = document.getElementById('externalProfileContent');
        setInnerHTMLIfEmpty(content, getSellerProfileSkeletonHTML());
        openSellerProfile(tag.toLowerCase(), 'listings', { pushState: false });
        return;
    }
    if (params.get('vip_verified') === '1' || state?.view === 'vip-verified') {
        showSection('vip-verified-listings-section').then(() => restoreScrollFromHistoryState());
        if (!vipVerifiedPageLoading && (!Array.isArray(vipVerifiedPageListings) || vipVerifiedPageListings.length === 0)) {
            void fetchVipVerifiedPageFromSupabase({ silent: true, includeProfiles: true, limit: 24, cursor: null, reset: true, filters: currentFilters });
        }
        return;
    }
    const listingParam = params.get('listing');
    const editParam = params.get('edit');
    const newListingParam = params.get('new');
    if (listingParam) {
        const id = Number(listingParam);
        if (Number.isFinite(id) && id > 0) {
            openListingDetail(id, { pushState: false });
            return;
        }
    }
    if (editParam) {
        const id = Number(editParam);
        if (Number.isFinite(id) && id > 0) {
            openEditListingPageById(id, { pushState: false });
            return;
        }
    }
    if (newListingParam) {
        openCreateListingPage({ pushState: false });
        return;
    }
    const sectionParam = String(params.get('section') || '').trim();
    if (sectionParam && crawlableStaticSections.has(sectionParam)) {
        showSection(sectionParam).then(() => restoreScrollFromHistoryState());
        if (String(params.get('modal') || '').trim() === 'contact') {
            openModal('contactModal');
            scheduleLucideCreateIcons(document.getElementById('contactModal'));
        }
        return;
    }
    const sectionFromState = state?.sectionId ? String(state.sectionId || '').trim() : '';
    if (sectionFromState && document.getElementById(sectionFromState)) {
        showSection(sectionFromState).then(() => restoreScrollFromHistoryState());
        return;
    }
    const lastSectionRaw = localStorage.getItem('winjayLastSection') || 'home-section';
    const blocked = ['profile-section', 'messages-section', 'favorites-section', 'settings-section', 'admin-dashboard-section'];
    const safeLast =
        lastSectionRaw === 'listing-detail-section' || lastSectionRaw === 'create-listing-section'
            ? 'home-section'
            : lastSectionRaw;
    const lastSection = (blocked.includes(safeLast) && !isLoggedIn()) ? 'home-section' : safeLast;
    showSection(lastSection).then(() => restoreScrollFromHistoryState());
    if (String(params.get('modal') || '').trim() === 'contact') {
        openModal('contactModal');
        scheduleLucideCreateIcons(document.getElementById('contactModal'));
    }
}

let syncMessagesHeightTimer = null;
let messagesViewportHooked = false;

let bodyScrollLocked = false;
let bodyScrollLockedY = 0;

function lockBodyScroll() {
    if (bodyScrollLocked) return;
    bodyScrollLocked = true;
    bodyScrollLockedY = window.scrollY || window.pageYOffset || 0;
    document.documentElement.classList.add('messages-scroll-lock');
    document.body.classList.add('messages-scroll-lock');
    document.body.style.position = 'fixed';
    document.body.style.top = `-${bodyScrollLockedY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
}

function unlockBodyScroll() {
    if (!bodyScrollLocked) return;
    document.documentElement.classList.remove('messages-scroll-lock');
    document.body.classList.remove('messages-scroll-lock');
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    const y = bodyScrollLockedY;
    bodyScrollLocked = false;
    bodyScrollLockedY = 0;
    window.scrollTo(0, y);
}

function shouldLockMessagesScroll() {
    const section = document.getElementById('messages-section');
    return !!section && section.classList.contains('active') && window.innerWidth <= 900;
}

function syncMessagesScrollLock() {
    if (shouldLockMessagesScroll()) lockBodyScroll();
    else unlockBodyScroll();
}

function syncMessagesContainerHeight() {
    const section = document.getElementById('messages-section');
    if (!section || !section.classList.contains('active')) return;
    syncMessagesScrollLock();
    const container = section.querySelector('.messages-container');
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const viewportHeight = window.visualViewport?.height || window.innerHeight || 0;
    let bottomPadding = 16;
    if (window.innerWidth <= 768) {
        const footer = document.querySelector('.mobile-footer-bar');
        if (footer) {
            const footerRect = footer.getBoundingClientRect();
            if (footerRect.height > 0) bottomPadding += footerRect.height;
        }
    }
    const nextHeight = Math.max(240, Math.floor(viewportHeight - rect.top - bottomPadding));
    container.style.height = `${nextHeight}px`;
}

function scheduleSyncMessagesContainerHeight() {
    if (syncMessagesHeightTimer) window.clearTimeout(syncMessagesHeightTimer);
    syncMessagesHeightTimer = window.setTimeout(() => {
        syncMessagesContainerHeight();
        syncMessagesHeightTimer = null;
    }, 80);

    if (!messagesViewportHooked) {
        messagesViewportHooked = true;
        window.addEventListener('resize', syncMessagesContainerHeight, { passive: true });
        window.visualViewport?.addEventListener?.('resize', syncMessagesContainerHeight, { passive: true });
        window.visualViewport?.addEventListener?.('scroll', syncMessagesContainerHeight, { passive: true });
    }

    window.setTimeout(syncMessagesContainerHeight, 240);
}

function filterByCategory(category, element) {
    showSection('home-section');
    currentFilters.category = category === 'all' ? '' : category;
    currentFilters.subcategory = '';
    document.querySelectorAll('.category-list li a, .sidebar-section li a').forEach(a => a.classList.remove('active'));
    if (element) element.classList.add('active');
    document.getElementById('filterCategory').value = currentFilters.category;
    applyFilters();
    syncHomeCategorySwipeFromFilters();
}

function toggleFilterPanel() {
    document.getElementById('filterPanel').classList.toggle('active');
}

function applyFilters() {
    const prevCategory = currentFilters.category;
    currentFilters.wilaya = document.getElementById('filterWilaya').value;
    currentFilters.category = document.getElementById('filterCategory').value;
    if (currentFilters.category !== prevCategory) currentFilters.subcategory = '';
    currentFilters.priceMin = document.getElementById('priceMin').value;
    currentFilters.priceMax = document.getElementById('priceMax').value;
    currentFilters.sort = document.getElementById('sortSelect').value;
    updateActiveFilters();
    triggerListingsRefetch();
    syncHomeCategorySwipeFromFilters();
}

function clearFilters() {
    currentFilters = { search: '', category: '', subcategory: '', wilaya: '', priceMin: '', priceMax: '', sort: 'newest' };
    document.getElementById('mainSearchInput').value = '';
    document.getElementById('filterWilaya').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    document.getElementById('sortSelect').value = 'newest';
    document.getElementById('filterPanel').classList.remove('active');
    updateActiveFilters();
    triggerListingsRefetch({ immediate: true });
    syncHomeCategorySwipeFromFilters();
}

function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    let tags = [];
    if (currentFilters.category) tags.push(`<span class="filter-tag">${currentFilters.category} <button onclick="removeFilter('category')">&times;</button></span>`);
    if (currentFilters.subcategory) tags.push(`<span class="filter-tag">${currentFilters.subcategory} <button onclick="removeFilter('subcategory')">&times;</button></span>`);
    if (currentFilters.wilaya) tags.push(`<span class="filter-tag">${currentFilters.wilaya} <button onclick="removeFilter('wilaya')">&times;</button></span>`);
    if (currentFilters.priceMin || currentFilters.priceMax) {
        const priceText = `${currentFilters.priceMin || '0'} - ${currentFilters.priceMax || '∞'} DA`;
        tags.push(`<span class="filter-tag">${priceText} <button onclick="removeFilter('price')">&times;</button></span>`);
    }
    if (tags.length > 1) {
        tags.push(`<button class="clear-all-filters-btn" onclick="clearAllFilters()">Tout effacer</button>`);
    }
    container.innerHTML = tags.join('');
}

function removeFilter(type) {
    if (type === 'category') {
        currentFilters.category = '';
        currentFilters.subcategory = '';
        document.getElementById('filterCategory').value = '';
        syncHomeCategorySwipeFromFilters();
    } else if (type === 'subcategory') {
        currentFilters.subcategory = '';
        syncHomeCategorySwipeFromFilters();
    } else if (type === 'wilaya') {
        currentFilters.wilaya = '';
        document.getElementById('filterWilaya').value = '';
    } else if (type === 'price') {
        currentFilters.priceMin = '';
        currentFilters.priceMax = '';
        document.getElementById('priceMin').value = '';
        document.getElementById('priceMax').value = '';
    }
    updateActiveFilters();
    triggerListingsRefetch({ immediate: true });
}

function clearAllFilters() {
    currentFilters = { search: '', category: '', subcategory: '', wilaya: '', priceMin: '', priceMax: '', sort: 'newest' };
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterWilaya').value = '';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    document.getElementById('sortSelect').value = 'newest';
    document.getElementById('mainSearchInput').value = '';
    updateActiveFilters();
    triggerListingsRefetch({ immediate: true });
    syncHomeCategorySwipeFromFilters();
    showToast('Filtres effacés', 'filter');
}

function handleSort() {
    currentFilters.sort = document.getElementById('sortSelect').value;
    triggerListingsRefetch({ immediate: true });
}

function getFilteredListings() {
    if (!DEMO_MODE) {
        const copy = Array.isArray(listings) ? listings.slice() : [];
        if (currentFilters.sort === 'newest') {
            copy.sort((a, b) => {
                const av = hasListingVideo(a) ? 1 : 0;
                const bv = hasListingVideo(b) ? 1 : 0;
                if (av !== bv) return bv - av;
                const ta = new Date(a?.created_at || 0).getTime();
                const tb = new Date(b?.created_at || 0).getTime();
                return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
            });
        }
        return copy;
    }
    let filtered = [...listings];
    if (currentFilters.search) {
        filtered = filtered.filter(l => l.title.toLowerCase().includes(currentFilters.search) || l.category.toLowerCase().includes(currentFilters.search));
    }
    if (currentFilters.category) {
        filtered = filtered.filter(l => l.category === currentFilters.category);
    }
    if (currentFilters.subcategory) {
        filtered = filtered.filter(l => String(l.subcategory || '') === currentFilters.subcategory);
    }
    if (currentFilters.wilaya) {
        filtered = filtered.filter(l => String(l.wilaya || '') === currentFilters.wilaya);
    }
    if (currentFilters.priceMin) {
        filtered = filtered.filter(l => l.price >= parseInt(currentFilters.priceMin));
    }
    if (currentFilters.priceMax) {
        filtered = filtered.filter(l => l.price <= parseInt(currentFilters.priceMax));
    }
    if (currentFilters.sort === 'newest') {
        filtered.sort((a, b) => {
            const av = hasListingVideo(a) ? 1 : 0;
            const bv = hasListingVideo(b) ? 1 : 0;
            if (av !== bv) return bv - av;
            const ta = new Date(a?.created_at || 0).getTime();
            const tb = new Date(b?.created_at || 0).getTime();
            return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0);
        });
    } else if (currentFilters.sort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentFilters.sort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    }
    return filtered;
}

function getHomeListingsSkeletonHTML(count = 12) {
    const n = Math.max(1, Math.min(30, Number(count) || 12));
    return `<div class="loading-skeleton"><div class="skeleton-grid">${Array.from({ length: n }, () => `<div class="skeleton-card"></div>`).join('')}</div></div>`;
}

function getSellerProfileSkeletonHTML() {
    return `
        <div class="profile-skeleton">
            <div class="profile-header profile-skeleton-header">
                <div class="cover-photo-container profile-skeleton-cover">
                    <div class="skeleton-block"></div>
                </div>
                <div class="profile-info-container">
                    <div class="profile-pic-wrapper">
                        <div class="skeleton-block" style="width: 120px; height: 120px; border-radius: 50%;"></div>
                    </div>
                    <div class="profile-details">
                        <div class="profile-text">
                            <div class="profile-skeleton-lines">
                                <div class="skeleton-block" style="height: 22px; width: 220px;"></div>
                                <div class="skeleton-block" style="height: 16px; width: 120px;"></div>
                                <div class="skeleton-block" style="height: 18px; width: 160px;"></div>
                                <div class="skeleton-block" style="height: 18px; width: 200px;"></div>
                            </div>
                            <div class="profile-bio-box profile-skeleton-bio">
                                <div class="skeleton-block" style="height: 18px; width: 160px;"></div>
                                <div class="skeleton-block" style="height: 18px; width: 150px;"></div>
                                <div class="skeleton-block" style="height: 18px; width: 190px;"></div>
                                <div class="skeleton-block" style="height: 18px; width: 210px;"></div>
                            </div>
                        </div>
                        <div class="profile-actions-row profile-skeleton-actions-row">
                            <div class="skeleton-block"></div>
                            <div class="skeleton-block"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="profile-content">
                <div class="profile-skeleton-tabs">
                    <div class="skeleton-block"></div>
                    <div class="skeleton-block"></div>
                </div>
                ${getHomeListingsSkeletonHTML(8)}
            </div>
        </div>
    `;
}

function getListingDetailSkeletonHTML() {
    return `
        <div class="profile-skeleton">
            <div class="profile-header profile-skeleton-header">
                <div class="cover-photo-container profile-skeleton-cover">
                    <div class="skeleton-block"></div>
                </div>
                <div class="profile-info-container">
                    <div class="profile-details" style="width: 100%;">
                        <div class="profile-skeleton-lines">
                            <div class="skeleton-block" style="height: 26px; width: 240px;"></div>
                            <div class="skeleton-block" style="height: 18px; width: 160px;"></div>
                            <div class="skeleton-block" style="height: 18px; width: 200px;"></div>
                        </div>
                        <div class="profile-actions-row profile-skeleton-actions-row">
                            <div class="skeleton-block"></div>
                            <div class="skeleton-block"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="profile-content">
                ${getHomeListingsSkeletonHTML(6)}
            </div>
        </div>
    `;
}

function setCarouselIndex(carouselEl, index, { animate = true, persist = false } = {}) {
    if (!carouselEl) return;
    const track = carouselEl.querySelector('.carousel-track');
    const slides = carouselEl.querySelectorAll('.carousel-slide');
    if (!track || slides.length === 0) return;
    const columnsRaw = Number(carouselEl.dataset.columns) || 1;
    const columns = Math.max(1, Math.min(3, columnsRaw));
    const max = Math.max(0, slides.length - columns);
    const step = 100 / columns;
    const next = Math.max(0, Math.min(max, Number(index) || 0));
    carouselEl.dataset.index = String(next);
    const vipWrap = carouselEl.closest('.vip-video-card-media');
    if (vipWrap) {
        vipWrap.dataset.carouselIndex = String(next);
        if (next !== 0) {
            const v = vipWrap.querySelector('video.vip-video-preview[data-vip-video="1"]');
            if (v) {
                try {
                    v.pause();
                } catch (e) {
                    null;
                }
            }
        }
    }
    if (carouselEl.dataset.carousel === 'detail') {
        const v = carouselEl.querySelector('video.detail-video[data-detail-video="1"]');
        if (v) {
            if (next !== 0) {
                try {
                    v.pause();
                } catch (e) {
                    null;
                }
            } else {
                try {
                    const p = v.play();
                    if (p && typeof p.then === 'function') {
                        p.then(() => {
                            carouselEl.dataset.soundGate = '0';
                        }).catch(() => {
                            carouselEl.dataset.soundGate = '1';
                        });
                    }
                } catch (e) {
                    carouselEl.dataset.soundGate = '1';
                }
            }
        }
    }
    if (!animate) track.style.transition = 'none';
    track.style.transform = `translateX(-${next * step}%)`;
    const prevBtn = carouselEl.querySelector('.carousel-arrow.prev');
    const nextBtn = carouselEl.querySelector('.carousel-arrow.next');
    const hideArrows = slides.length <= columns || max <= 0;
    if (prevBtn) {
        prevBtn.style.display = hideArrows ? 'none' : '';
        prevBtn.disabled = hideArrows ? true : next <= 0;
    }
    if (nextBtn) {
        nextBtn.style.display = hideArrows ? 'none' : '';
        nextBtn.disabled = hideArrows ? true : next >= max;
    }
    const dots = carouselEl.querySelectorAll('.carousel-dot');
    dots.forEach((d) => {
        const i = Number(d.getAttribute('data-dot-index')) || 0;
        d.classList.toggle('active', i === next);
    });
    if (!animate) {
        void track.offsetHeight;
        track.style.transition = '';
    }
    if (persist && carouselEl.dataset.carousel === 'detail') {
        const listingId = Number(carouselEl.dataset.listingId) || 0;
        if (listingId) listingDetailImageIndex[listingId] = next;
    }
}

function initCarouselElement(carouselEl) {
    if (!carouselEl || carouselEl.dataset.bound) return;
    carouselEl.dataset.bound = '1';
    const viewport = carouselEl.querySelector('.carousel-viewport');
    const track = carouselEl.querySelector('.carousel-track');
    if (!viewport || !track) return;
    const slides = carouselEl.querySelectorAll('.carousel-slide');
    const columnsRaw = Number(carouselEl.dataset.columns) || 1;
    const columns = Math.max(1, Math.min(3, columnsRaw));
    if (slides.length <= columns) {
        setCarouselIndex(carouselEl, 0, { animate: false, persist: carouselEl.dataset.carousel === 'detail' });
        return;
    }

    const applyIndex = (idx, opts) => setCarouselIndex(carouselEl, idx, opts);
    const maxIndex = Math.max(0, slides.length - columns);
    const step = 100 / columns;
    const getIndex = () => Math.max(0, Math.min(maxIndex, Number(carouselEl.dataset.index) || 0));

    carouselEl.querySelectorAll('.carousel-dot').forEach((dot) => {
        if (dot.dataset.bound) return;
        dot.dataset.bound = '1';
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            const idx = Number(dot.getAttribute('data-dot-index')) || 0;
            applyIndex(idx, { animate: true, persist: carouselEl.dataset.carousel === 'detail' });
        });
    });

    const prevBtn = carouselEl.querySelector('.carousel-arrow.prev');
    const nextBtn = carouselEl.querySelector('.carousel-arrow.next');
    if (prevBtn && !prevBtn.dataset.bound) {
        prevBtn.dataset.bound = '1';
        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyIndex(getIndex() - 1, { animate: true, persist: true });
        });
    }
    if (nextBtn && !nextBtn.dataset.bound) {
        nextBtn.dataset.bound = '1';
        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            applyIndex(getIndex() + 1, { animate: true, persist: true });
        });
    }
    setCarouselIndex(carouselEl, getIndex(), { animate: false, persist: false });

    let pointerId = null;
    let startX = 0;
    let startY = 0;
    let startIndex = 0;
    let startTime = 0;
    let dragging = false;

    const endDrag = () => {
        pointerId = null;
        dragging = false;
        carouselEl.dataset.dragging = '';
    };

    viewport.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        pointerId = e.pointerId;
        startX = e.clientX;
        startY = e.clientY;
        startIndex = getIndex();
        startTime = performance.now();
        dragging = false;
        carouselEl.dataset.dragged = '';
        carouselEl.dataset.dragging = '1';
        try {
            viewport.setPointerCapture(pointerId);
        } catch (err) {
            null;
        }
    });

    viewport.addEventListener('pointermove', (e) => {
        if (pointerId === null || e.pointerId !== pointerId) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (!dragging) {
            if (Math.abs(dx) < 6) return;
            if (Math.abs(dx) <= Math.abs(dy) * 1.1) return;
            dragging = true;
            track.style.transition = 'none';
        }
        e.preventDefault();
        const pct = (dx / Math.max(1, viewport.clientWidth)) * 100;
        const base = -startIndex * step;
        track.style.transform = `translateX(${base + pct}%)`;
    }, { passive: false });

    const onPointerUp = (e) => {
        if (pointerId === null || e.pointerId !== pointerId) return;
        const dx = e.clientX - startX;
        const dt = Math.max(1, performance.now() - (startTime || performance.now()));
        const vx = dx / dt;
        let next = startIndex;
        if (dragging) {
            const width = Math.max(1, viewport.clientWidth);
            const floatIndex = startIndex - (dx / width) * columns;
            const flick = Math.abs(vx) > 0.8 && Math.abs(dx) > 18;
            if (flick) {
                next = dx < 0 ? (startIndex + 1) : (startIndex - 1);
            } else {
                next = Math.round(floatIndex);
            }
            carouselEl.dataset.dragged = '1';
            lastCarouselSwipeAt = Date.now();
        } else {
            const width = Math.max(1, viewport.clientWidth);
            const smallHorizontal = Math.abs(dx) > Math.max(10, width * 0.04) && Math.abs(dx) > Math.abs(e.clientY - startY);
            if (smallHorizontal) carouselEl.dataset.dragged = '1';
        }
        track.style.transition = '';
        applyIndex(Math.max(0, Math.min(maxIndex, next)), { animate: true, persist: carouselEl.dataset.carousel === 'detail' });
        endDrag();
    };

    viewport.addEventListener('pointerup', onPointerUp);
    viewport.addEventListener('pointercancel', onPointerUp);
    viewport.addEventListener('lostpointercapture', endDrag);

    carouselEl.addEventListener('click', (e) => {
        if (carouselEl.dataset.dragged === '1') {
            e.stopPropagation();
            e.preventDefault();
            carouselEl.dataset.dragged = '';
            return;
        }
        if (carouselEl.dataset.carousel === 'home-hero') {
            const linkEl = e.target instanceof Element ? e.target.closest('a[href]') : null;
            const href = String(linkEl?.getAttribute('href') || '').trim();
            if (href) {
                e.preventDefault();
                e.stopPropagation();
                const target = String(linkEl?.getAttribute('target') || '').trim().toLowerCase();
                if (target === '_blank') {
                    try {
                        window.open(href, '_blank', 'noopener,noreferrer');
                    } catch (err) {
                        window.location.href = href;
                    }
                } else {
                    window.location.href = href;
                }
            }
            carouselEl.dataset.dragged = '';
            return;
        }
        if (carouselEl.dataset.carousel === 'detail') {
            const idx = getIndex();
            const imgs = carouselEl.querySelectorAll('img');
            const url = imgs[idx]?.getAttribute('data-src') || imgs[idx]?.src || '';
            if (url) {
                e.stopPropagation();
                openLightbox(url);
            }
        }
    }, true);

    applyIndex(getIndex(), { animate: false });
}

function initCarouselsInContainer(container) {
    if (!container) return;
    container.querySelectorAll('.js-carousel').forEach((el) => initCarouselElement(el));
}

function getVipVideoListingsForHome() {
    const items = (listings || []).filter((l) => {
        if (!l) return false;
        return hasListingVideo(l);
    });
    items.sort((a, b) => {
        const ta = new Date(a?.created_at || 0).getTime();
        const tb = new Date(b?.created_at || 0).getTime();
        return tb - ta;
    });
    return items.slice(0, 4);
}

let vipVideoAutoplayObserver = null;
let vipVideoAutoplayCleanupTimer = null;
const VIP_VIDEO_MUTED_STORAGE_KEY = 'winjayVipVideoMutedV1';
let vipVideoSessionUnmuted = false;
let vipVideoHoveredListingId = 0;

function getVipVideoMutedPreference() {
    return !vipVideoSessionUnmuted;
}

function setVipVideoMutedPreference(value) {
    vipVideoSessionUnmuted = !value;
}

function getListingVideoPublicUrl(item) {
    const meta = getListingVideoMeta(item);
    if (!meta.hasVideo) return '';
    if (meta.url) return meta.url;
    if (!meta.path) return '';
    try {
        const client = initSupabase();
        const { data: publicData } = client.storage.from(LISTING_VIDEOS_BUCKET).getPublicUrl(meta.path);
        return publicData?.publicUrl || '';
    } catch (e) {
        return '';
    }
}

function createVipVideoCardHTML(item) {
    const isFavorite = favorites.includes(item.id);
    const pulse = pendingHeartPulses.has(item.id) && isFavorite;
    const availability = String(item.availability || '').toLowerCase();
    const badgeText = availability === 'sold' ? 'Sold' : (availability === 'reserved' ? 'Reserved' : '');
    const videoUrl = getListingVideoPublicUrl(item);
    const carouselImages = getListingImagesForCard(item).slice(0, 8);
    const muted = getVipVideoMutedPreference();
    const muteIcon = muted ? 'volume-x' : 'volume-2';
    const mediaHTML = videoUrl
        ? `<div class="card-media-wrap vip-video-card-media" data-carousel-index="0">
                <div class="vip-video-loader" aria-hidden="true"></div>
                <video class="card-img vip-video-preview" data-vip-video="1" data-listing-id="${item.id}" data-src="${videoUrl}" ${carouselImages[0] ? `poster="${carouselImages[0]}"` : ''} playsinline muted loop preload="none"></video>
                <button type="button" class="vip-video-mute-btn" data-listing-id="${item.id}" data-muted="${muted ? '1' : '0'}" aria-label="${muted ? 'Activer le son' : 'Couper le son'}" onclick="toggleVipVideoMuted(event, ${item.id})"><i data-lucide="${muteIcon}"></i></button>
                <button type="button" class="vip-video-pause-btn" data-listing-id="${item.id}" data-paused="0" aria-label="Pause" onclick="toggleVipVideoPaused(event, ${item.id})"><i data-lucide="pause"></i></button>
            </div>`
        : (carouselImages.length > 1
            ? `<div class="card-media-wrap"><div class="card-carousel js-carousel" data-carousel="card" data-listing-id="${item.id}" data-index="0">
                    <div class="carousel-viewport">
                        <div class="carousel-track">
                            ${carouselImages.map((u) => `<div class="carousel-slide"><img src="${u}" data-src="${u}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low" draggable="false"></div>`).join('')}
                        </div>
                    </div>
                    <div class="carousel-dots">
                        ${carouselImages.map((_, i) => `<button type="button" class="carousel-dot ${i === 0 ? 'active' : ''}" data-dot-index="${i}"></button>`).join('')}
                    </div>
                </div></div>`
            : `<div class="card-media-wrap"><img src="${item.cardImage || item.image}" data-src="${item.cardImage || item.image}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low"></div>`);
    const sellerStrip = getPremiumSellerStripHTML(item);
    return `
        <div class="card" onclick="handleCardOpen(event, ${item.id})">
            <button class="favorite-btn ${isFavorite ? 'active' : ''} ${pulse ? 'pulse' : ''}" onclick="toggleFavorite(event, ${item.id})">
                <i data-lucide="heart"></i>
            </button>
            ${badgeText ? `<div class="card-status-badge ${availability}">${badgeText}</div>` : ''}
            ${mediaHTML}
            <div class="card-content">
                <div class="card-price">${(item.price_type === 'Free' || Number(item.price) === 0) ? 'Free' : `${new Intl.NumberFormat('fr-DZ').format(item.price)} DZD`}</div>
                <div class="card-title">${item.title}</div>
                ${sellerStrip}
                <div class="card-footer">
                    <span><i data-lucide="map-pin" style="width:12px"></i> ${item.location}</span>
                    <span>${item.date}</span>
                </div>
                <div class="card-stats">
                    <span><i data-lucide="eye"></i> ${Number(item.views_count) || 0}</span>
                    <span><i data-lucide="heart"></i> ${Number(item.likes_count) || 0}</span>
                </div>
            </div>
        </div>`;
}

function applyVipVideoMutedPreferenceToAll() {
    const muted = getVipVideoMutedPreference();
    document.querySelectorAll('video.vip-video-preview[data-vip-video="1"]').forEach((v) => {
        try {
            v.muted = muted;
        } catch (e) {
            null;
        }
    });
    document.querySelectorAll('.vip-video-mute-btn[data-listing-id]').forEach((btn) => {
        try {
            btn.dataset.muted = muted ? '1' : '0';
            btn.setAttribute('aria-label', muted ? 'Activer le son' : 'Couper le son');
            const icon = btn.querySelector('[data-lucide]');
            if (icon) icon.setAttribute('data-lucide', muted ? 'volume-x' : 'volume-2');
        } catch (e) {
            null;
        }
    });
    scheduleLucideCreateIcons();
}

function toggleVipVideoMuted(event, listingId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const current = getVipVideoMutedPreference();
    const next = !current;
    setVipVideoMutedPreference(next);
    applyVipVideoMutedPreferenceToAll();
    if (!next) {
        const v = document.querySelector(`video.vip-video-preview[data-vip-video="1"][data-listing-id="${Number(listingId) || 0}"]`);
        if (v) {
            try {
                v.play();
            } catch (e) {
                null;
            }
        }
    }
}

function toggleVipVideoPaused(event, listingId) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    const id = Number(listingId) || 0;
    const v = document.querySelector(`video.vip-video-preview[data-vip-video="1"][data-listing-id="${id}"]`);
    const btn = document.querySelector(`.vip-video-pause-btn[data-listing-id="${id}"]`);
    if (!v || !btn) return;
    const pausedNow = btn.dataset.paused === '1';
    const nextPaused = !pausedNow;
    btn.dataset.paused = nextPaused ? '1' : '0';
    btn.setAttribute('aria-label', nextPaused ? 'Play' : 'Pause');
    const icon = btn.querySelector('[data-lucide]');
    if (icon) icon.setAttribute('data-lucide', nextPaused ? 'play' : 'pause');
    if (nextPaused) {
        v.dataset.userPaused = '1';
        try {
            v.pause();
        } catch (e) {
            null;
        }
    } else {
        v.dataset.userPaused = '0';
        try {
            v.muted = getVipVideoMutedPreference();
        } catch (e) {
            null;
        }
        if (!v.getAttribute('src')) {
            const src = v.dataset.src || '';
            if (src) v.setAttribute('src', src);
            try {
                v.load();
            } catch (e) {
                null;
            }
        }
        try {
            const p = v.play();
            if (p && typeof p.catch === 'function') p.catch(() => null);
        } catch (e) {
            null;
        }
    }
    scheduleLucideCreateIcons();
}

function stopVipVideoAutoplayObserver() {
    if (vipVideoAutoplayCleanupTimer) {
        try {
            clearTimeout(vipVideoAutoplayCleanupTimer);
        } catch (e) {
            null;
        }
        vipVideoAutoplayCleanupTimer = null;
    }
    if (vipVideoAutoplayObserver) {
        try {
            vipVideoAutoplayObserver.disconnect();
        } catch (e) {
            null;
        }
        vipVideoAutoplayObserver = null;
    }
}

function stopVipVideoPreviews({ unload = true } = {}) {
    stopVipVideoAutoplayObserver();
    const videos = Array.from(document.querySelectorAll('video.vip-video-preview[data-vip-video="1"]'));
    videos.forEach((v) => {
        try {
            v.pause();
        } catch (e) {
            null;
        }
        const wrap = v.closest('.vip-video-card-media');
        if (wrap) wrap.dataset.videoReady = '0';
        if (unload) {
            try {
                v.removeAttribute('src');
                v.load();
            } catch (e) {
                null;
            }
        }
    });
}

function stopAllActiveVideos() {
    document.querySelectorAll('video').forEach((v) => {
        try {
            v.pause();
        } catch (e) {
            null;
        }
    });
    stopVipVideoPreviews({ unload: true });
}

function setupVipVideoAutoplay(row) {
    stopVipVideoAutoplayObserver();
    if (!row) return;
    if (!('IntersectionObserver' in window)) return;
    const videos = Array.from(row.querySelectorAll('video.vip-video-preview[data-vip-video="1"]'));
    if (!videos.length) return;
    const hoverEnabled = !!(window.matchMedia && window.matchMedia('(hover: hover)').matches);
    videos.forEach((v) => {
        const wrap = v.closest('.vip-video-card-media');
        if (wrap && !wrap.dataset.videoReady) wrap.dataset.videoReady = '0';
        if (!v.dataset.readyBound) {
            v.dataset.readyBound = '1';
            v.addEventListener('canplay', () => {
                const w = v.closest('.vip-video-card-media');
                if (!w) return;
                w.dataset.videoReady = '1';
            });
        }
        if (hoverEnabled && !v.dataset.hoverBound) {
            v.dataset.hoverBound = '1';
            const listingId = Number(v.dataset.listingId) || 0;
            const card = v.closest('.card');
            const onEnter = () => {
                vipVideoHoveredListingId = listingId;
                try {
                    row.dispatchEvent(new CustomEvent('vipVideoHoverChanged'));
                } catch (e) {
                    null;
                }
            };
            const onLeave = () => {
                if (vipVideoHoveredListingId === listingId) vipVideoHoveredListingId = 0;
                try {
                    row.dispatchEvent(new CustomEvent('vipVideoHoverChanged'));
                } catch (e) {
                    null;
                }
            };
            if (card) {
                card.addEventListener('mouseenter', onEnter);
                card.addEventListener('mouseleave', onLeave);
            } else {
                v.addEventListener('mouseenter', onEnter);
                v.addEventListener('mouseleave', onLeave);
            }
        }
    });
    const visibility = new Map();

    const applyPlayback = () => {
        const muted = getVipVideoMutedPreference();
        const firstVideo = videos[0] || null;
        const hoveredVideo = vipVideoHoveredListingId
            ? videos.find((x) => Number(x.dataset.listingId) === vipVideoHoveredListingId) || null
            : null;
        const hoveredRatio = hoveredVideo ? (Number(visibility.get(hoveredVideo)) || 0) : 0;
        const firstRatio = firstVideo ? (Number(visibility.get(firstVideo)) || 0) : 0;

        let best = null;
        let bestRatio = 0;
        visibility.forEach((ratio, v) => {
            if (ratio > bestRatio) {
                bestRatio = ratio;
                best = v;
            }
        });

        let candidate = null;
        if (hoveredVideo && hoveredRatio > 0) {
            candidate = hoveredVideo;
        } else if (firstVideo && firstRatio >= 0.55) {
            candidate = firstVideo;
        } else if (best && bestRatio >= 0.55) {
            candidate = best;
        }

        videos.forEach((v) => {
            const userPaused = v.dataset.userPaused === '1';
            const shouldPlay = candidate && v === candidate && !userPaused;
            try {
                v.muted = muted;
            } catch (e) {
                null;
            }
            if (shouldPlay) {
                if (!v.getAttribute('src')) {
                    const src = v.dataset.src || '';
                    if (src) v.setAttribute('src', src);
                    try {
                        v.load();
                    } catch (e) {
                        null;
                    }
                }
                const p = v.play();
                if (p && typeof p.catch === 'function') p.catch(() => null);
            } else {
                try {
                    v.pause();
                } catch (e) {
                    null;
                }
            }
        });
    };

    vipVideoAutoplayObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const v = entry.target;
            visibility.set(v, entry.isIntersecting ? entry.intersectionRatio : 0);
        });
        applyPlayback();
    }, { root: null, threshold: [0, 0.25, 0.55, 0.75, 1] });
    videos.forEach((v) => vipVideoAutoplayObserver.observe(v));
    if (hoverEnabled && !row.dataset.hoverBound) {
        row.dataset.hoverBound = '1';
        row.addEventListener('vipVideoHoverChanged', () => applyPlayback());
        row.addEventListener('mouseleave', () => {
            vipVideoHoveredListingId = 0;
            applyPlayback();
        });
    }
    vipVideoAutoplayCleanupTimer = setTimeout(() => {
        try {
            const activeSection = getActiveSectionId();
            if (activeSection !== 'home-section') stopVipVideoAutoplayObserver();
        } catch (e) {
            null;
        }
    }, 3000);
    applyVipVideoMutedPreferenceToAll();
}

function renderVipVideoSection() {
    const section = document.getElementById('vipVideoSection');
    const row = document.getElementById('vipVideoRow');
    if (!section || !row) return;
    if (homeInitialListingsLoading && !homeInitialListingsLoaded) {
        section.style.display = 'none';
        row.innerHTML = '';
        stopVipVideoAutoplayObserver();
        return;
    }
    const items = DEMO_MODE ? getVipVideoListingsForHome() : (Array.isArray(vipVideoListings) ? vipVideoListings.slice() : []);
    if (!items.length) {
        section.style.display = 'none';
        row.innerHTML = '';
        stopVipVideoAutoplayObserver();
        return;
    }
    section.style.display = '';
    row.innerHTML = items.map((x) => createVipVideoCardHTML(x)).join('');
    initCarouselsInContainer(row);
    setupVipVideoAutoplay(row);
    scheduleLucideCreateIcons(row);
}

async function renderFeaturedStoresSection() {
    const section = document.getElementById('featuredStoresSection');
    const row = document.getElementById('featuredStoresRow');
    if (!section || !row) return;
    const client = initSupabase();
    if (!client) {
        section.style.display = 'none';
        return;
    }
    try {
        const { data, error } = await client
            .from('profiles')
            .select('id, display_name, tag, avatar_url, is_vip')
            .eq('is_vip', true)
            .limit(20);
        if (error || !data || data.length === 0) {
            section.style.display = 'none';
            return;
        }
        const stores = data.map(p => ({
            id: p.id,
            name: p.display_name || 'Store',
            tag: p.tag || `@user${p.id.slice(0, 6)}`,
            avatar: p.avatar_url || DEFAULT_AVATAR_SVG
        }));
        section.style.display = '';
        row.innerHTML = stores.map(s => `
            <a href="#" class="featured-store-badge" onclick="event.preventDefault(); openSellerProfile('${s.tag}');">
                <img src="${s.avatar}" alt="${s.name}" class="featured-store-avatar">
                <span class="featured-store-name">${escapeHtml(s.name)}</span>
                <span class="featured-store-tag">${s.tag}</span>
            </a>
        `).join('');
        scheduleLucideCreateIcons(row);
    } catch (e) {
        section.style.display = 'none';
    }
}

function renderListings() {
    if (getActiveSectionId() === 'home-section' && homeInitialListingsLoading && !homeInitialListingsLoaded) {
        if (listingsGrid) listingsGrid.innerHTML = getHomeListingsSkeletonHTML(12);
        const empty = document.getElementById('emptyState');
        if (empty) empty.style.display = 'none';
        const gridEl = document.getElementById('listingsGrid');
        if (gridEl) gridEl.style.display = 'grid';
        if (pagination) pagination.innerHTML = '';
        updateLoadMoreListingsUI();
        renderVipVideoSection();
        void renderFeaturedStoresSection();
        scheduleLucideCreateIcons();
        return;
    }
    const vipItems = getVipVideoListingsForHome();
    const allFiltered = getFilteredListings().filter((l) => !hasListingVideo(l));
    const vipVerifiedListings = DEMO_MODE
        ? allFiltered.filter(item => isVipOrVerifiedSeller(item))
        : (Array.isArray(vipVerifiedHomeListings) ? vipVerifiedHomeListings.slice() : []);
    const regularListings = allFiltered.filter(item => !isVipOrVerifiedSeller(item));
    const vipVerifiedSection = document.getElementById('vipVerifiedSection');
    const vipVerifiedRow = document.getElementById('vipVerifiedRow');
    const vipVerifiedMoreBtn = document.getElementById('vipVerifiedMoreBtn');
    const regularHeader = document.getElementById('regularListingsHeader');
    if (vipVerifiedSection && vipVerifiedRow) {
        if (vipVerifiedListings.length > 0) {
            vipVerifiedSection.style.display = '';
            vipVerifiedRow.innerHTML = vipVerifiedListings.slice(0, 4).map(item => createVipVerifiedCardHTML(item)).join('');
            if (vipVerifiedMoreBtn) vipVerifiedMoreBtn.style.display = (!DEMO_MODE && vipVerifiedHomeHasMore) || (DEMO_MODE && vipVerifiedListings.length > 4) ? '' : 'none';
        } else {
            vipVerifiedSection.style.display = 'none';
            vipVerifiedRow.innerHTML = '';
            if (vipVerifiedMoreBtn) vipVerifiedMoreBtn.style.display = 'none';
        }
    }
    if (regularHeader) {
        regularHeader.style.display = regularListings.length > 0 ? '' : 'none';
    }
    if (pagination) {
        pagination.innerHTML = '';
        pagination.style.display = DEMO_MODE ? '' : 'none';
    }
    const totalItems = regularListings.length;
    listingsGrid.innerHTML = totalItems > 0 ? regularListings.map(item => createCardHTML(item)).join('') : '';
    try {
        const imgs = Array.from(listingsGrid.querySelectorAll('img.card-img'));
        imgs.forEach((img, idx) => {
            if (!(img instanceof HTMLImageElement)) return;
            if (idx < 4) {
                img.loading = 'eager';
                img.setAttribute('fetchpriority', 'high');
            } else {
                img.loading = 'lazy';
                img.removeAttribute('fetchpriority');
            }
            img.decoding = 'async';
        });
    } catch (e) {
        null;
    }
    const isHome = getActiveSectionId() === 'home-section';
    const shouldShowEmpty = totalItems === 0 && vipVerifiedListings.length === 0 && (!isHome || (homeInitialListingsLoaded && !homeInitialListingsLoading));
    document.getElementById('emptyState').style.display = shouldShowEmpty ? 'block' : 'none';
    document.getElementById('listingsGrid').style.display = totalItems === 0 ? 'none' : 'grid';
    updateLoadMoreListingsUI();
    initCarouselsInContainer(vipVerifiedRow);
    initCarouselsInContainer(listingsGrid);
    renderVipVideoSection();
    void renderFeaturedStoresSection();
    scheduleLucideCreateIcons(vipVerifiedRow);
    scheduleLucideCreateIcons(listingsGrid);
}

function openVipVerifiedListingsPage({ pushState = true } = {}) {
    snapshotCurrentViewToHistoryState();
    if (pushState) {
        const from = getActiveSectionId();
        try {
            const url = new URL(window.location.href);
            url.searchParams.delete('listing');
            url.searchParams.delete('new');
            url.searchParams.delete('edit');
            url.searchParams.delete('profile');
            url.searchParams.delete('course');
            url.searchParams.delete('chat');
            url.searchParams.delete('section');
            url.searchParams.delete('modal');
            url.searchParams.set('vip_verified', '1');
            const next = url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : '');
            const state = getSafeHistoryState();
            history.pushState({ ...state, __winjay: true, view: 'vip-verified', sectionId: 'vip-verified-listings-section', from, scrollY: 0 }, '', next);
        } catch (e) {
            null;
        }
    }
    showSection('vip-verified-listings-section');
    void fetchVipVerifiedPageFromSupabase({ silent: true, includeProfiles: true, limit: 24, cursor: null, reset: true, filters: currentFilters });
}

function renderVipVerifiedListingsPage() {
    const grid = document.getElementById('vipVerifiedPageGrid');
    const empty = document.getElementById('vipVerifiedPageEmpty');
    if (!grid) return;
    const items = DEMO_MODE
        ? getFilteredListings().filter((l) => !hasListingVideo(l)).filter((l) => isVipOrVerifiedSeller(l))
        : (Array.isArray(vipVerifiedPageListings) ? vipVerifiedPageListings.slice() : []);
    const loadMoreBtn = (!DEMO_MODE && vipVerifiedPageHasMore)
        ? `<div class="load-more-wrap" style="display:flex; justify-content:center; margin-top: 16px;">
                <button class="submit-btn load-more-btn" type="button" onclick="loadMoreVipVerifiedListingsPage()">Load more</button>
           </div>`
        : '';
    grid.innerHTML = items.length > 0 ? items.map((item) => createVipVerifiedCardHTML(item)).join('') + loadMoreBtn : '';
    if (empty) empty.style.display = items.length > 0 ? 'none' : 'block';
    initCarouselsInContainer(grid);
    scheduleLucideCreateIcons(grid);
}

function renderFavorites() {
    const favoriteListings = listings.filter(l => favorites.includes(l.id));
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = favoriteListings.length > 0 ?
        favoriteListings.map(item => createCardHTML(item)).join('') :
        '';
    document.getElementById('favoritesEmpty').style.display = favoriteListings.length === 0 ? 'block' : 'none';
    initCarouselsInContainer(grid);
    scheduleLucideCreateIcons(grid);
}

const HOME_BANNERS_TABLE = 'home_banners';
const HOME_BANNERS_BUCKET = 'home_banners';
const HOME_BANNERS_CACHE_TTL_MS = 60 * 1000;
let homeBannersCache = null;
let homeBannersCacheAt = 0;
let homeHeroAutoplayTimer = null;
let homeHeroAutoplayCarousel = null;

function invalidateHomeHeroRenderCache() {
    homeBannersCache = null;
    homeBannersCacheAt = 0;
    const slot = document.getElementById('homeHeroSlot');
    if (slot) slot.dataset.renderedAt = '0';
}

function safeExternalHttpUrl(url) {
    const raw = String(url || '').trim();
    if (!raw) return '';
    try {
        const candidate = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw.replace(/^\/+/, '')}`;
        const u = new URL(candidate);
        const proto = String(u.protocol || '').toLowerCase();
        if (proto !== 'http:' && proto !== 'https:') return '';
        return u.toString();
    } catch (e) {
        return '';
    }
}

function homeBannerIsActive(banner, now = new Date()) {
    const b = banner && typeof banner === 'object' ? banner : {};
    if (!b.is_active) return false;
    const nowMs = now instanceof Date ? now.getTime() : Date.now();
    const startMs = b.starts_at ? new Date(b.starts_at).getTime() : null;
    const endMs = b.ends_at ? new Date(b.ends_at).getTime() : null;
    if (Number.isFinite(startMs) && nowMs < startMs) return false;
    if (Number.isFinite(endMs) && nowMs >= endMs) return false;
    return true;
}

function normalizeHomeBannerSlot(banner) {
    const b = banner && typeof banner === 'object' ? banner : {};
    const raw = String(b.slot || b.placement || b.position || b.kind || '').trim().toLowerCase();
    if (raw === 'secondary' || raw === 'side' || raw === 'mpu' || raw === 'right') return 'secondary';
    return 'main';
}

async function fetchHomeBannersRaw({ force = false } = {}) {
    const client = initSupabase();
    if (!client) return { rows: [], error: new Error('Supabase is not configured') };
    const nowMs = Date.now();
    if (!force && Array.isArray(homeBannersCache) && nowMs - homeBannersCacheAt < HOME_BANNERS_CACHE_TTL_MS) {
        return { rows: homeBannersCache, error: null };
    }
    try {
        const { data, error } = await client
            .from(HOME_BANNERS_TABLE)
            .select('*')
            .order('sort_order', { ascending: true })
            .order('id', { ascending: true });
        if (error) return { rows: [], error };
        const rows = Array.isArray(data) ? data : [];
        homeBannersCache = rows;
        homeBannersCacheAt = nowMs;
        return { rows, error: null };
    } catch (e) {
        return { rows: [], error: e };
    }
}

function getHomeBannerPublicUrl(imagePath) {
    const client = initSupabase();
    if (!client) return '';
    const path = String(imagePath || '').trim();
    if (!path) return '';
    try {
        const { data } = client.storage.from(HOME_BANNERS_BUCKET).getPublicUrl(path);
        return String(data?.publicUrl || '').trim();
    } catch (e) {
        return '';
    }
}

function stopHomeHeroAutoplay() {
    if (homeHeroAutoplayTimer) clearInterval(homeHeroAutoplayTimer);
    homeHeroAutoplayTimer = null;
    homeHeroAutoplayCarousel = null;
}

function startHomeHeroAutoplay(carouselEl) {
    stopHomeHeroAutoplay();
    const el = carouselEl;
    if (!el) return;
    const slides = el.querySelectorAll('.carousel-slide');
    const total = slides.length;
    if (total <= 1) return;
    homeHeroAutoplayCarousel = el;
    let paused = false;
    el.addEventListener('mouseenter', () => { paused = true; });
    el.addEventListener('mouseleave', () => { paused = false; });
    homeHeroAutoplayTimer = setInterval(() => {
        if (paused) return;
        if (!homeHeroAutoplayCarousel || getActiveSectionId() !== 'home-section') return;
        const current = Number(homeHeroAutoplayCarousel.dataset.index || 0) || 0;
        const next = (current + 1) % total;
        setCarouselIndex(homeHeroAutoplayCarousel, next, { animate: true });
    }, 5000);
}

async function renderHomeHeroBanners({ force = false } = {}) {
    const slot = document.getElementById('homeHeroSlot');
    if (!slot) return;
    if (getActiveSectionId() !== 'home-section') return;
    const nowMs = Date.now();
    const renderedAt = Number(slot.dataset.renderedAt) || 0;
    if (!force && renderedAt && nowMs - renderedAt < HOME_BANNERS_CACHE_TTL_MS) return;
    slot.dataset.renderedAt = String(nowMs);
    const fallbackHTML = `
        <div class="hero">
            <h1 data-i18n="home_hero_title">Trouvez ce dont vous avez besoin, localement.</h1>
            <p data-i18n="home_hero_subtitle">Le meilleur marché pour tout.</p>
        </div>
    `;
    const raw = await fetchHomeBannersRaw({ force });
    const allRows = raw.error ? [] : raw.rows;
    const activeRows = (Array.isArray(allRows) ? allRows : []).filter((b) => homeBannerIsActive(b));
    if (!activeRows.length) {
        stopHomeHeroAutoplay();
        slot.innerHTML = fallbackHTML;
        applyTranslations();
        scheduleLucideCreateIcons();
        return;
    }
    const sideRow = activeRows.find((b) => normalizeHomeBannerSlot(b) === 'secondary') || null;
    const carouselRows = activeRows.filter((b) => normalizeHomeBannerSlot(b) !== 'secondary');
    const linkedCarouselRows = carouselRows.filter((b) => !!safeExternalHttpUrl(b.link_url));
    const effectiveCarouselRows = linkedCarouselRows.length ? linkedCarouselRows : carouselRows;
    const slidesHTML = effectiveCarouselRows
        .map((b) => {
            const url = getHomeBannerPublicUrl(b.image_path);
            if (!url) return '';
            const href = safeExternalHttpUrl(b.link_url);
            const label = escapeHtml(String(b.title || ''));
            const pane = `<div class="home-hero-banner" role="img" aria-label="${label}" style="background-image:url('${escapeHtml(url)}')"></div>`;
            if (href) return `<a class="carousel-slide" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${pane}</a>`;
            return `<div class="carousel-slide">${pane}</div>`;
        })
        .filter(Boolean)
        .join('');
    if (!slidesHTML) {
        stopHomeHeroAutoplay();
        slot.innerHTML = fallbackHTML;
        applyTranslations();
        scheduleLucideCreateIcons();
        return;
    }
    const sideHTML = (() => {
        if (!sideRow) return '';
        const url = getHomeBannerPublicUrl(sideRow.image_path);
        if (!url) return '';
        const href = safeExternalHttpUrl(sideRow.link_url);
        const label = escapeHtml(String(sideRow.title || ''));
        const pane = `<div class="home-hero-side-banner" role="img" aria-label="${label}" style="background-image:url('${escapeHtml(url)}')"></div>`;
        if (href) return `<a class="home-hero-side" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${pane}</a>`;
        return `<div class="home-hero-side">${pane}</div>`;
    })();

    slot.innerHTML = `
        <div class="home-hero-layout">
            <div class="home-hero-main">
                <div class="home-hero-carousel js-carousel" data-columns="1" data-carousel="home-hero">
                    <div class="carousel-viewport">
                        <div class="carousel-track">
                            ${slidesHTML}
                        </div>
                    </div>
                    <div class="carousel-dots"></div>
                </div>
            </div>
            ${sideHTML}
        </div>
    `;
    initCarouselsInContainer(slot);
    const carouselEl = slot.querySelector('.js-carousel');
    if (carouselEl) startHomeHeroAutoplay(carouselEl);
}

function getPremiumSellerStripHTML(item) {
    const seller = item?.seller;
    if (!seller || !(seller.verified || seller.vip)) return '';
    const tag = String(seller.tag || '').trim();
    const safeTag = tag ? escapeHtml(tag) : '';
    const safeName = escapeHtml(String(seller.name || ''));
    const safePic = escapeHtml(String(seller.pic || seller.profilePic || ''));
    const badges = [
        seller.verified ? '<i data-lucide="badge-check"></i>' : '',
        seller.vip ? '<i data-lucide="crown"></i>' : ''
    ].filter(Boolean).join('');
    const badgesHTML = badges ? `<span class="card-seller-badges">${badges}</span>` : '';
    return `
        <div class="card-seller-strip">
            <img class="card-seller-avatar" src="${safePic}" alt="${safeName}" loading="lazy" decoding="async">
            <div class="card-seller-meta">
                <div class="card-seller-name">${safeName} ${badgesHTML}</div>
                ${safeTag ? `<div class="card-seller-tag">${safeTag}</div>` : ''}
            </div>
        </div>
    `;
}

const cardHtmlCache = new Map();

function clearCardHtmlCache() {
    try {
        cardHtmlCache.clear();
    } catch (e) {
        null;
    }
}

function isVipOrVerifiedSeller(item) {
    const seller = item?.seller;
    return !!(seller && (seller.vip || seller.verified));
}

function createVipVerifiedCardHTML(item) {
    const isFavorite = favorites.includes(item.id);
    const pulse = pendingHeartPulses.has(item.id) && isFavorite;
    const carouselImages = getListingImagesForCard(item).slice(0, 8);
    const videoBadge = hasListingVideo(item) ? `<span class="video-play-badge"><i data-lucide="play"></i></span>` : '';
    const mediaHTML = carouselImages.length > 1
        ? `<div class="card-media-wrap"><div class="card-carousel js-carousel" data-carousel="card" data-listing-id="${item.id}" data-index="0">
                <div class="carousel-viewport">
                    <div class="carousel-track">
                        ${carouselImages.map((u) => `<div class="carousel-slide"><img src="${u}" data-src="${u}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low" draggable="false"></div>`).join('')}
                    </div>
                </div>
                ${videoBadge}
                <div class="carousel-dots">
                    ${carouselImages.map((_, i) => `<button type="button" class="carousel-dot ${i === 0 ? 'active' : ''}" data-dot-index="${i}"></button>`).join('')}
                </div>
            </div></div>`
        : `<div class="card-media-wrap">${videoBadge}<img src="${item.cardImage || item.image}" data-src="${item.cardImage || item.image}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low"></div>`;
    const priceDisplay = (item.price_type === 'Free' || Number(item.price) === 0) ? 'Free' : `${new Intl.NumberFormat('fr-DZ').format(item.price)} DZD`;
    const phone = item.contact_phone || '';
    const messageClick = `event.stopPropagation(); startChatWithListing(${item.id});`;
    const callClick = phone ? `event.stopPropagation(); window.open('tel:${escapeHtml(phone)}', '_self');` : `event.stopPropagation(); showToast('Numéro non disponible', 'phone');`;
    const seller = item?.seller || {};
    const sellerAvatar = escapeHtml(String(seller.pic || seller.profilePic || seller.avatar_url || DEFAULT_AVATAR_SVG));
    const sellerName = String(seller.name || seller.display_name || seller.displayName || '').trim() || 'Utilisateur';
    const sellerTag = String(seller.tag || '').trim() || `@user${String(item.owner_id || '').slice(0, 6)}`;
    const verifiedBadge = seller.verified ? `<span class="verified-badge-small"><i data-lucide="badge-check"></i></span>` : '';
    const vipBadge = seller.vip ? `<span class="vip-badge-small">VIP</span>` : '';
    const badgesHTML = [verifiedBadge, vipBadge].filter(Boolean).join('');
    const locationDisplay = item.location || item.city || item.wilaya || 'Non spécifié';
    const dateDisplay = item.date || formatRelativeTime(item.created_at);
    const viewsDisplay = Number(item.views_count) || 0;
    const likesDisplay = Number(item.likes_count) || 0;
    const html = `
        <div class="card vip-card" onclick="handleCardOpen(event, ${item.id})">
            <button class="favorite-btn ${isFavorite ? 'active' : ''} ${pulse ? 'pulse' : ''}" onclick="toggleFavorite(event, ${item.id})">
                <i data-lucide="heart"></i>
            </button>
            ${mediaHTML}
            <div class="card-content">
                <div class="card-header-row">
                    <div class="card-seller-info">
                        <img src="${sellerAvatar}" alt="${escapeHtml(sellerName)}" class="card-seller-avatar">
                        <div class="card-seller-details">
                            <div class="card-seller-name">
                                <span class="card-seller-name-text">${escapeHtml(sellerName)}</span>
                                ${badgesHTML ? `<span class="card-seller-badges">${badgesHTML}</span>` : ''}
                            </div>
                            <div class="card-seller-tag">${escapeHtml(sellerTag)}</div>
                        </div>
                    </div>
                    <div class="card-price">${priceDisplay}</div>
                </div>
                <div class="card-title">${escapeHtml(item.title)}</div>
                <div class="card-meta-row">
                    <span class="card-meta-item"><i data-lucide="map-pin"></i> ${escapeHtml(locationDisplay)}</span>
                    <span class="card-meta-item"><i data-lucide="calendar"></i> ${escapeHtml(dateDisplay)}</span>
                </div>
                <div class="card-stats-row">
                    <span class="card-stat-item"><i data-lucide="eye"></i> ${viewsDisplay}</span>
                    <span class="card-stat-item"><i data-lucide="heart"></i> ${likesDisplay}</span>
                </div>
                <div class="card-actions">
                    <button class="card-action-btn message" type="button" onclick="${messageClick}">
                        <i data-lucide="message-circle"></i> Message
                    </button>
                    <button class="card-action-btn call" type="button" onclick="${callClick}">
                        <i data-lucide="phone"></i> Appeler
                    </button>
                </div>
            </div>
        </div>`;
    return html;
}

function createCardHTML(item) {
    const cacheKey = `${item.id}:${item.likes_count}:${item.status}:${item.availability}:${item.title}`;
    try {
        if (cardHtmlCache.has(cacheKey)) return cardHtmlCache.get(cacheKey);
    } catch (e) {
        null;
    }

    const isFavorite = favorites.includes(item.id);
    const pulse = pendingHeartPulses.has(item.id) && isFavorite;
    const availability = String(item.availability || '').toLowerCase();
    const badgeText = availability === 'sold' ? 'Sold' : (availability === 'reserved' ? 'Reserved' : '');
    const carouselImages = getListingImagesForCard(item).slice(0, 8);
    const videoBadge = hasListingVideo(item) ? `<span class="video-play-badge"><i data-lucide="play"></i></span>` : '';
    const sellerStrip = getPremiumSellerStripHTML(item);
    const phone = item.contact_phone || '';
    const messageClick = `event.stopPropagation(); startChatWithListing(${item.id});`;
    const callClick = phone ? `event.stopPropagation(); window.open('tel:${escapeHtml(phone)}', '_self');` : `event.stopPropagation(); showToast('Numéro non disponible', 'phone');`;
    const mediaHTML = carouselImages.length > 1
        ? `<div class="card-media-wrap"><div class="card-carousel js-carousel" data-carousel="card" data-listing-id="${item.id}" data-index="0">
                <div class="carousel-viewport">
                    <div class="carousel-track">
                        ${carouselImages.map((u) => `<div class="carousel-slide"><img src="${u}" data-src="${u}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low" draggable="false"></div>`).join('')}
                    </div>
                </div>
                ${videoBadge}
                <div class="carousel-dots">
                    ${carouselImages.map((_, i) => `<button type="button" class="carousel-dot ${i === 0 ? 'active' : ''}" data-dot-index="${i}"></button>`).join('')}
                </div>
            </div></div>`
        : `<div class="card-media-wrap">${videoBadge}<img src="${item.cardImage || item.image}" data-src="${item.cardImage || item.image}" alt="${escapeHtml(item.title)}" class="card-img" loading="lazy" decoding="async" fetchpriority="low"></div>`;
    const html = `
        <div class="card" onclick="handleCardOpen(event, ${item.id})">
            <button class="favorite-btn ${isFavorite ? 'active' : ''} ${pulse ? 'pulse' : ''}" onclick="toggleFavorite(event, ${item.id})">
                <i data-lucide="heart"></i>
            </button>
            ${badgeText ? `<div class="card-status-badge ${availability}">${badgeText}</div>` : ''}
            ${mediaHTML}
            <div class="card-content">
                <div class="card-price">${(item.price_type === 'Free' || Number(item.price) === 0) ? 'Free' : `${new Intl.NumberFormat('fr-DZ').format(item.price)} DZD`}</div>
                <div class="card-title">${escapeHtml(item.title)}</div>
                <div class="card-actions">
                    <button class="card-action-btn message" type="button" onclick="${messageClick}">
                        <i data-lucide="message-circle"></i> Message
                    </button>
                    <button class="card-action-btn call" type="button" onclick="${callClick}">
                        <i data-lucide="phone"></i> Appeler
                    </button>
                </div>
            </div>
        </div>`;
    try {
        cardHtmlCache.set(cacheKey, html);
        if (cardHtmlCache.size > 200) {
            const firstKey = cardHtmlCache.keys().next().value;
            cardHtmlCache.delete(firstKey);
        }
    } catch (e) {
        null;
    }
    return html;
}

function getRatingHTML(rating, reviews, { showEmpty = false } = {}) {
    const reviewCount = Number(reviews) || 0;
    const safeRating = Number(rating) || 0;
    if (!showEmpty && (reviewCount <= 0 || safeRating <= 0)) return '';
    const fullStars = Math.floor(safeRating);
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
        starsHTML += `<i data-lucide="star" style="${i < fullStars ? 'fill: #ffb400;' : ''} width: 14px; height: 14px;"></i>`;
    }
    const ratingLabel = safeRating > 0 ? String(safeRating) : '0';
    return `<div class="rating-container"><div class="stars">${starsHTML}</div><span class="rating-value">${ratingLabel}</span><span class="reviews-count">(${reviewCount} avis)</span></div>`;
}

function makeSafeId(value) {
    return String(value).replace(/[^a-zA-Z0-9_-]/g, '_');
}

function getReplyElementIds(contextType, targetId, index) {
    const safe = makeSafeId(targetId);
    return {
        boxId: `replyBox_${contextType}_${safe}_${index}`,
        inputId: `replyInput_${contextType}_${safe}_${index}`
    };
}

function getThreadElementIds(contextType, targetId, index) {
    const safe = makeSafeId(targetId);
    return {
        boxId: `threadBox_${contextType}_${safe}_${index}`,
        inputId: `threadInput_${contextType}_${safe}_${index}`
    };
}

function getReviewEditElementIds(contextType, targetId, index) {
    const safe = makeSafeId(targetId);
    return {
        boxId: `reviewEditBox_${contextType}_${safe}_${index}`,
        inputId: `reviewEditInput_${contextType}_${safe}_${index}`
    };
}

function getThreadEditElementIds(contextType, targetId, index, threadIndex) {
    const safe = makeSafeId(targetId);
    return {
        boxId: `threadEditBox_${contextType}_${safe}_${index}_${threadIndex}`,
        inputId: `threadEditInput_${contextType}_${safe}_${index}_${threadIndex}`
    };
}

function findProfileByTag(tag) {
    if (tag === userProfile.tag) return userProfile;
    return botProfiles.find(p => p.tag === tag) || reviewers.find(p => p.tag === tag) || null;
}

function recalculateProfileRating(profile) {
    const reviews = profile.reviewsData || [];
    profile.reviews = reviews.length;
    if (reviews.length === 0) {
        profile.rating = 0;
        return;
    }
    const avg = reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length;
    profile.rating = Math.round(avg * 10) / 10;
}

function getCurrentReviewerIdentity() {
    return {
        user: userProfile.name,
        tag: userProfile.tag,
        pic: userProfile.profilePic
    };
}

function toggleThreadBox(contextType, targetId, index) {
    const { boxId, inputId } = getThreadElementIds(contextType, targetId, index);
    const box = document.getElementById(boxId);
    const input = document.getElementById(inputId);
    if (!box || !input) return;
    const show = box.style.display !== 'block';
    box.style.display = show ? 'block' : 'none';
    if (show) input.focus();
}

async function addThreadComment(contextType, targetId, index) {
    const record = getReviewRecord(contextType, targetId, index);
    if (!record) return;
    const { inputId } = getThreadElementIds(contextType, targetId, index);
    const input = document.getElementById(inputId);
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        showToast('Ajoutez un commentaire.', 'alert-circle');
        return;
    }

    if (contextType === 'profile') {
        if (DEMO_MODE) {
            record.thread = Array.isArray(record.thread) ? record.thread : [];
            const reviewer = getCurrentReviewerIdentity();
            record.thread.push({
                user: reviewer.user,
                tag: reviewer.tag,
                pic: reviewer.pic,
                date: "À l'instant",
                text: escapeHtml(text)
            });
            input.value = '';
            if (targetId === userProfile.tag) {
                renderMyProfileReviews();
                switchMyProfileSection('reviews');
            } else {
                openSellerProfile(targetId, 'reviews');
            }
            showToast('Commentaire ajouté.', 'check-circle');
            return;
        }
        if (!requireAuthOrPrompt()) return;
        const client = initSupabase();
        if (!client || !currentSupabaseUserId) return;
        const reviewId = String(record?.id || '').trim();
        if (!reviewId) {
            showToast('Review not found', 'alert-circle');
            return;
        }
        const { error } = await client.from('profile_review_comments').insert({ review_id: reviewId, author_id: currentSupabaseUserId, body: escapeHtml(text) });
        if (error) {
            showToast(error.message || 'Failed to add comment', 'alert-circle');
            return;
        }
        input.value = '';
        if (record?.authorId) {
            await createNotificationFromClient({
                recipientId: record.authorId,
                type: 'profile_review_comment',
                targetProfileId: currentSupabaseUserId,
                meta: { reviewId }
            });
        }
        if (targetId === userProfile.tag) {
            userProfile.reviewsData = await fetchProfileReviews(currentSupabaseUserId);
            updateProfileUI();
            renderMyProfileReviews();
            switchMyProfileSection('reviews');
        } else {
            await openSellerProfile(targetId, 'reviews');
        }
        showToast('Commentaire ajouté.', 'check-circle');
        return;
    }

    if (contextType === 'listing') {
        const listingId = Number(targetId);
        if (DEMO_MODE) {
            record.thread = Array.isArray(record.thread) ? record.thread : [];
            const reviewer = getCurrentReviewerIdentity();
            record.thread.push({
                user: reviewer.user,
                tag: reviewer.tag,
                pic: reviewer.pic,
                date: "À l'instant",
                text: escapeHtml(text)
            });
            input.value = '';
            listingReviewPanelState[listingId] = true;
            openListingDetail(listingId);
            showToast('Commentaire ajouté.', 'check-circle');
            return;
        }
        if (!requireAuthOrPrompt()) return;
        const client = initSupabase();
        if (!client || !currentSupabaseUserId) return;
        const reviewId = String(record?.id || '').trim();
        if (!reviewId) {
            showToast('Review not found', 'alert-circle');
            return;
        }
        const { error } = await client.from('listing_review_comments').insert({ review_id: reviewId, author_id: currentSupabaseUserId, text: escapeHtml(text) });
        if (error) {
            showToast(error.message || 'Failed to add comment', 'alert-circle');
            return;
        }
        input.value = '';
        const listing = listings.find((l) => l.id === listingId);
        if (record?.authorId) {
            await createNotificationFromClient({
                recipientId: record.authorId,
                type: 'listing_review_comment',
                listingId: listingId,
                meta: { reviewId }
            });
        }
        listingReviewPanelState[listingId] = true;
        await refreshListingReviewsForListingDetail(listingId, listing?.seller?.name || 'Vendeur');
        openListingDetail(listingId);
        showToast('Commentaire ajouté.', 'check-circle');
    }
}

function toggleReviewEditBox(contextType, targetId, index) {
    const { boxId, inputId } = getReviewEditElementIds(contextType, targetId, index);
    const box = document.getElementById(boxId);
    const input = document.getElementById(inputId);
    if (!box || !input) return;
    const record = getReviewRecord(contextType, targetId, index);
    if (!record) return;
    if (record.tag !== userProfile.tag) return;
    const show = box.style.display !== 'block';
    box.style.display = show ? 'block' : 'none';
    if (show) input.focus();
}

async function saveReviewEdit(contextType, targetId, index) {
    const { inputId } = getReviewEditElementIds(contextType, targetId, index);
    const input = document.getElementById(inputId);
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        showToast('Ajoutez un commentaire.', 'alert-circle');
        return;
    }
    const record = getReviewRecord(contextType, targetId, index);
    if (!record) return;
    if (record.tag !== userProfile.tag) {
        showToast('Vous ne pouvez modifier que votre propre avis.', 'alert-circle');
        return;
    }
    record.comment = escapeHtml(text);

    if (contextType === 'profile') {
        if (!DEMO_MODE) {
            const client = initSupabase();
            if (client && currentSupabaseUserId && record?.id) {
                await client.from('profile_reviews').update({ comment: escapeHtml(text) }).eq('id', record.id).eq('author_id', currentSupabaseUserId);
            }
        }
        if (targetId === userProfile.tag) {
            renderMyProfileReviews();
            switchMyProfileSection('reviews');
        } else {
            openSellerProfile(targetId, 'reviews');
        }
        showToast('Avis modifié.', 'check-circle');
        return;
    }

    if (contextType === 'listing') {
        const listingId = Number(targetId);
        if (!DEMO_MODE) {
            const client = initSupabase();
            if (client && currentSupabaseUserId && record?.id) {
                await client.from('listing_reviews').update({ comment: escapeHtml(text) }).eq('id', record.id).eq('author_id', currentSupabaseUserId);
            }
        }
        listingReviewPanelState[listingId] = true;
        openListingDetail(listingId);
        showToast('Avis modifié.', 'check-circle');
    }
}

function toggleThreadEditBox(contextType, targetId, index, threadIndex) {
    const { boxId, inputId } = getThreadEditElementIds(contextType, targetId, index, threadIndex);
    const box = document.getElementById(boxId);
    const input = document.getElementById(inputId);
    if (!box || !input) return;
    const record = getReviewRecord(contextType, targetId, index);
    const entry = record?.thread?.[threadIndex];
    if (!entry) return;
    if (entry.tag !== userProfile.tag) return;
    const show = box.style.display !== 'block';
    box.style.display = show ? 'block' : 'none';
    if (show) input.focus();
}

async function saveThreadEdit(contextType, targetId, index, threadIndex) {
    const { inputId } = getThreadEditElementIds(contextType, targetId, index, threadIndex);
    const input = document.getElementById(inputId);
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
        showToast('Ajoutez un commentaire.', 'alert-circle');
        return;
    }
    const record = getReviewRecord(contextType, targetId, index);
    const entry = record?.thread?.[threadIndex];
    if (!entry) return;
    if (entry.tag !== userProfile.tag) {
        showToast('Vous ne pouvez modifier que votre propre commentaire.', 'alert-circle');
        return;
    }
    entry.text = escapeHtml(text);

    if (contextType === 'profile') {
        if (!DEMO_MODE) {
            const client = initSupabase();
            if (client && currentSupabaseUserId && entry?.id) {
                await client.from('profile_review_comments').update({ text: escapeHtml(text) }).eq('id', entry.id).eq('author_id', currentSupabaseUserId);
            }
        }
        if (targetId === userProfile.tag) {
            renderMyProfileReviews();
            switchMyProfileSection('reviews');
        } else {
            openSellerProfile(targetId, 'reviews');
        }
        showToast('Commentaire modifié.', 'check-circle');
        return;
    }

    if (contextType === 'listing') {
        const listingId = Number(targetId);
        if (!DEMO_MODE) {
            const client = initSupabase();
            if (client && currentSupabaseUserId && entry?.id) {
                await client.from('listing_review_comments').update({ text: escapeHtml(text) }).eq('id', entry.id).eq('author_id', currentSupabaseUserId);
            }
        }
        listingReviewPanelState[listingId] = true;
        openListingDetail(listingId);
        showToast('Commentaire modifié.', 'check-circle');
    }
}

async function addProfileReviewById(targetProfileId, source = 'seller-profile') {
    const ratingInput = document.getElementById(source === 'my-profile' ? 'myProfileReviewRating' : 'sellerProfileReviewRating');
    const commentInput = document.getElementById(source === 'my-profile' ? 'myProfileReviewComment' : 'sellerProfileReviewComment');
    const rating = Number(ratingInput?.value || 0);
    const comment = commentInput?.value?.trim?.() || '';

    if (!rating || rating < 1 || rating > 5) {
        showToast('Sélectionnez une note entre 1 et 5.', 'alert-circle');
        return;
    }
    if (!comment) {
        showToast('Ajoutez un commentaire.', 'alert-circle');
        return;
    }
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) {
        showToast('Please log in again', 'log-in');
        return;
    }
    const targetId = String(targetProfileId || '').trim();
    if (!targetId) {
        showToast('Seller profile not found', 'alert-circle');
        return;
    }
    if (String(targetId) === String(currentSupabaseUserId)) {
        showToast('Vous ne pouvez pas noter votre propre profil.', 'alert-circle');
        return;
    }

    const targetColumn = profileReviewsTargetColumn || 'target_profile_id';
    let insertPayload = {
        author_id: currentSupabaseUserId,
        rating,
        comment
    };
    insertPayload[targetColumn] = targetId;

    let { error } = await client.from('profile_reviews').insert(insertPayload);
    if (error && isMissingColumnError(error, targetColumn)) {
        const fallback = targetColumn === 'profile_id' ? 'target_profile_id' : 'profile_id';
        insertPayload = {
            author_id: currentSupabaseUserId,
            rating,
            comment
        };
        insertPayload[fallback] = targetId;
        const retry = await client.from('profile_reviews').insert(insertPayload);
        error = retry.error;
        if (!error) profileReviewsTargetColumn = fallback;
    } else if (!error) {
        profileReviewsTargetColumn = targetColumn;
    }
    if (error) {
        if (isProfileReviewsBackendMissing(error)) showToast('Profile reviews backend is not set up yet', 'alert-circle');
        else showToast(error.message || 'Failed to post review', 'alert-circle');
        return;
    }
    await createNotificationFromClient({ recipientId: targetId, type: 'profile_review', targetProfileId: targetId, meta: { rating } });
    if (ratingInput) ratingInput.value = '5';
    if (commentInput) commentInput.value = '';
    await openSellerProfileByOwnerId(targetId, 'reviews');
    showToast('Avis ajouté avec succès !', 'check-circle');
}

async function addListingReview(listingId) {
    const id = Number(listingId);
    const listing = listings.find((l) => l.id === id);
    if (!listing) return;
    const ratingInput = document.getElementById('listingReviewRating');
    const commentInput = document.getElementById('listingReviewComment');
    const rating = Number(ratingInput?.value || 0);
    const comment = commentInput?.value.trim() || '';

    if (!rating || rating < 1 || rating > 5) {
        showToast('Sélectionnez une note entre 1 et 5.', 'alert-circle');
        return;
    }
    if (!comment) {
        showToast('Ajoutez un commentaire.', 'alert-circle');
        return;
    }

    if (!requireAuthOrPrompt()) return;
    if (DEMO_MODE) {
        const reviewer = getCurrentReviewerIdentity();
        listing.reviewsData = listing.reviewsData || [];
        listing.reviewsData.unshift({
            user: reviewer.user,
            tag: reviewer.tag,
            pic: reviewer.pic,
            rating,
            date: "À l'instant",
            comment: escapeHtml(comment)
        });
        listingReviewPanelState[id] = true;
        openListingDetail(id);
        showToast('Avis ajouté à cette annonce.', 'check-circle');
        return;
    }

    const client = initSupabase();
    if (!client || !currentSupabaseUserId) {
        showToast('Reviews are not ready', 'alert-circle');
        return;
    }
    let hadExisting = false;
    try {
        const existing = await client
            .from('listing_reviews')
            .select('id')
            .eq('listing_id', id)
            .eq('author_id', currentSupabaseUserId)
            .limit(1);
        hadExisting = !existing.error && Array.isArray(existing.data) && existing.data.length > 0;
    } catch (e) {
        null;
    }
    const { error } = await client
        .from('listing_reviews')
        .upsert(
            {
                listing_id: id,
                author_id: currentSupabaseUserId,
                rating,
                comment
            },
            { onConflict: 'listing_id,author_id' }
        );
    if (error) {
        if (isListingReviewsBackendMissing(error)) showToast('Listing reviews backend is not set up yet', 'alert-circle');
        else showToast(error.message || "Impossible d'ajouter l'avis", 'alert-circle');
        return;
    }
    if (!hadExisting && listing?.owner_id) {
        await createNotificationFromClient({ recipientId: listing.owner_id, type: 'listing_review', listingId: id, meta: { rating } });
    }

    if (ratingInput) ratingInput.value = '5';
    if (commentInput) commentInput.value = '';
    listingReviewPanelState[id] = true;
    await refreshListingReviewsForListingDetail(id, listing?.seller?.name || 'Vendeur');
    showToast('Avis ajouté avec succès !', 'check-circle');
}

function getReviewRecord(contextType, targetId, index) {
    if (contextType === 'profile') {
        const profile = findProfileByTag(targetId);
        return profile?.reviewsData?.[index] || null;
    }
    if (contextType === 'listing') {
        const listingId = Number(targetId);
        const listing = listings.find(l => l.id === listingId);
        return listing?.reviewsData?.[index] || null;
    }
    return null;
}

function getReviewsListHTML(reviewsData, sellerName, isSentReviews = false, contextType = 'profile', targetId = '') {
    if (!reviewsData || reviewsData.length === 0) return '<p style="color: var(--text-muted);">Aucun avis pour le moment.</p>';
    return reviewsData.map((r, index) => {
        const { boxId: threadBoxId, inputId: threadInputId } = getThreadElementIds(contextType, targetId, index);

        const threadItems = Array.isArray(r.thread) ? r.thread : [];
        const { boxId: reviewEditBoxId, inputId: reviewEditInputId } = getReviewEditElementIds(contextType, targetId, index);
        const canEditReview = r.tag === userProfile.tag;
        const threadHtml = threadItems.length
            ? `<div class="review-thread">${threadItems.map((t, tIndex) => {
                const editIds = getThreadEditElementIds(contextType, targetId, index, tIndex);
                return `
                <div class="thread-item">
                    <img src="${t.pic}" class="thread-avatar clickable" alt="${t.user}" onclick="openSellerProfile('${t.tag}')">
                    <div class="thread-body">
                        <div class="thread-head">
                            <span class="thread-user clickable" onclick="openSellerProfile('${t.tag}')">${t.user}</span>
                            <span class="thread-date">${t.date || ''}</span>
                        </div>
                        <div class="thread-text">${t.text}</div>
                        ${t.tag === userProfile.tag ? `
                            <button class="review-action-btn" type="button" onclick="toggleThreadEditBox('${contextType}','${targetId}',${index},${tIndex})">Modifier</button>
                            <div class="reply-compose" id="${editIds.boxId}" style="display:none;">
                                <textarea id="${editIds.inputId}" rows="2" placeholder="Modifier votre commentaire...">${unescapeHtml(t.text)}</textarea>
                                <button class="submit-btn small" type="button" onclick="saveThreadEdit('${contextType}','${targetId}',${index},${tIndex})">Enregistrer</button>
                            </div>
                        ` : ''}
                    </div>
                </div>`;
            }).join('')}</div>`
            : '';

        const threadComposer = `
            <button class="review-action-btn" type="button" onclick="toggleThreadBox('${contextType}','${targetId}',${index})">Commenter</button>
            <div class="reply-compose" id="${threadBoxId}" style="display:none;">
                <textarea id="${threadInputId}" rows="2" placeholder="Ajouter un commentaire..."></textarea>
                <button class="submit-btn small" type="button" onclick="addThreadComment('${contextType}','${targetId}',${index})">Publier</button>
            </div>
        `;

        const reviewEditUi = canEditReview
            ? `
                <button class="review-action-btn" type="button" onclick="toggleReviewEditBox('${contextType}','${targetId}',${index})">Modifier</button>
                <div class="reply-compose" id="${reviewEditBoxId}" style="display:none;">
                    <textarea id="${reviewEditInputId}" rows="2" placeholder="Modifier votre avis...">${unescapeHtml(r.comment)}</textarea>
                    <button class="submit-btn small" type="button" onclick="saveReviewEdit('${contextType}','${targetId}',${index})">Enregistrer</button>
                </div>
            `
            : '';
        return `
        <div class="review-item">
            <img src="${r.pic}" class="review-avatar clickable" alt="${r.user}" onclick="openSellerProfile('${r.tag}')">
            <div class="review-content-wrapper">
                <div class="review-header">
                    <span class="review-user clickable" onclick="openSellerProfile('${r.tag}')">${r.user}</span>
                    <span class="review-date">${r.date}</span>
                </div>
                <div class="stars" style="margin-bottom: 8px;">${Array(5).fill(0).map((_, i) => `<i data-lucide="star" style="${i < r.rating ? 'fill: #ffb400;' : ''} width: 12px; height: 12px;"></i>`).join('')}</div>
                <div class="review-comment">${r.comment}</div>
                ${reviewEditUi}
                ${threadComposer}
                ${r.reply ? `<div class="review-reply"><div class="reply-header">Réponse de ${sellerName}</div><div class="reply-text">${r.reply}</div></div>` : ''}
                ${threadHtml}
                ${isSentReviews ? `<div style="font-size: 0.8rem; color: var(--primary-color); margin-top: 5px; font-weight: 600;">Posté sur le profil de ${sellerName}</div>` : ''}
            </div>
        </div>`;
    }).join('');
}

function toggleListingReviews(listingId) {
    listingReviewPanelState[listingId] = !listingReviewPanelState[listingId];
    openListingDetail(listingId);
    setTimeout(() => {
        document.getElementById('listingReviewsPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
}

function expandListingReviews(listingId) {
    listingReviewPanelState[listingId] = true;
    openListingDetail(listingId);
    setTimeout(() => {
        document.getElementById('listingReviewsPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
}

async function fetchProfileRatingSummary(profileId) {
    const id = String(profileId || '').trim();
    if (!id) return { rating: 0, reviews: 0 };
    if (profileRatingSummaryCache.has(id)) return profileRatingSummaryCache.get(id);

    const client = initSupabase();
    if (!client) return { rating: 0, reviews: 0 };
    const baseQuery = (targetColumn) =>
        client
            .from('profile_reviews')
            .select('rating')
            .eq(targetColumn, id)
            .limit(500);

    const firstColumn = profileReviewsTargetColumn || 'profile_id';
    let { data, error } = await baseQuery(firstColumn);
    if (error && isMissingColumnError(error, firstColumn)) {
        const fallback = firstColumn === 'profile_id' ? 'target_profile_id' : 'profile_id';
        const retry = await baseQuery(fallback);
        data = retry.data;
        error = retry.error;
        if (!error) profileReviewsTargetColumn = fallback;
    } else if (!error) {
        profileReviewsTargetColumn = firstColumn;
    }
    if (error) {
        if (!isProfileReviewsBackendMissing(error)) showToast(error.message || 'Failed to load reviews', 'alert-circle');
        return { rating: 0, reviews: 0 };
    }
    const rows = Array.isArray(data) ? data : [];
    const reviews = rows.length;
    const sum = rows.reduce((acc, r) => acc + (Number(r?.rating) || 0), 0);
    const rating = reviews ? Math.round((sum / reviews) * 10) / 10 : 0;
    const out = { rating, reviews };
    profileRatingSummaryCache.set(id, out);
    return out;
}

async function toggleFavorite(event, id) {
    event.stopPropagation();
    const btn = event.currentTarget;
    const listingId = Number(id);
    if (!Number.isFinite(listingId)) return;

    const getHomeCardContext = () => {
        const activeSection = getActiveSectionId();
        const card = btn?.closest?.('.card') || null;
        const inHomeGrid = !!btn?.closest?.('#listingsGrid');
        const inVipRow = !!btn?.closest?.('#vipVideoRow');
        return {
            activeSection,
            card,
            isHomeGridHeart: activeSection === 'home-section' && inHomeGrid,
            isVipRowHeart: activeSection === 'home-section' && inVipRow
        };
    };

    const replaceHeartStatText = (card, count) => {
        try {
            const heartSpan = Array.from(card.querySelectorAll('.card-stats span')).find((s) => {
                if (!s) return false;
                if (s.querySelector('i[data-lucide="heart"]')) return true;
                if (s.querySelector('svg.lucide-heart')) return true;
                if (s.querySelector('svg[data-lucide="heart"]')) return true;
                return false;
            });
            if (!heartSpan) return true;
            const icon =
                heartSpan.querySelector('i[data-lucide="heart"]') ||
                heartSpan.querySelector('svg.lucide-heart') ||
                heartSpan.querySelector('svg[data-lucide="heart"]');
            if (!icon) {
                heartSpan.textContent = String(Number(count) || 0);
                return true;
            }
            try {
                icon.remove();
            } catch (e) {
                null;
            }
            heartSpan.textContent = '';
            heartSpan.appendChild(icon);
            heartSpan.append(` ${Number(count) || 0}`);
        } catch (e) {
            null;
        }
        return true;
    };

    const updateHomeCardLikeUi = (count) => {
        const ctx = getHomeCardContext();
        if (!ctx.isHomeGridHeart || !ctx.card) return false;
        return replaceHeartStatText(ctx.card, count);
    };

    const updateVipRowLikeUi = (count) => {
        const ctx = getHomeCardContext();
        if (!ctx.isVipRowHeart || !ctx.card) return false;
        return replaceHeartStatText(ctx.card, count);
    };

    const pulseBtn = () => {
        if (!btn?.classList) return;
        btn.classList.add('pulse');
        window.setTimeout(() => btn.classList.remove('pulse'), 320);
    };
    const isCardHeart = !!btn?.classList?.contains('favorite-btn');
    const isDetailHeart = !!btn?.classList?.contains('detail-like-btn');

    if (DEMO_MODE) {
        const index = favorites.indexOf(listingId);
        const item = listings.find((l) => l.id === listingId);
        const prevLikesCount = Number(item?.likes_count) || 0;
        if (index > -1) {
            favorites.splice(index, 1);
            btn?.classList?.remove('active');
            if (item) item.likes_count = Math.max(0, prevLikesCount - 1);
            showToast('Retiré des favoris', 'heart');
        } else {
            favorites.push(listingId);
            btn?.classList?.add('active');
            if (item) item.likes_count = Math.max(0, prevLikesCount + 1);
            if (isDetailHeart || isCardHeart) pulseBtn();
            showToast('Ajouté aux favoris', 'heart');
        }
        if (favorites.includes(listingId)) pendingHeartPulses.add(listingId);
        const updated = updateHomeCardLikeUi(Number(item?.likes_count) || 0) || updateVipRowLikeUi(Number(item?.likes_count) || 0);
        if (!updated) renderListings();
        renderFavorites();
        pendingHeartPulses.delete(listingId);
        return;
    }

    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) return;

    const wasLiked = favorites.includes(listingId);
    const optimisticLiked = !wasLiked;
    const item = listings.find((l) => l.id === listingId);
    const prevLikesCount = Number(item?.likes_count) || 0;
    const optimisticLikesCount = Math.max(0, prevLikesCount + (optimisticLiked ? 1 : -1));

    if (optimisticLiked && !favorites.includes(listingId)) favorites.push(listingId);
    if (!optimisticLiked && favorites.includes(listingId)) favorites = favorites.filter((x) => x !== listingId);
    if (item) item.likes_count = optimisticLikesCount;
    btn?.classList?.toggle('active', optimisticLiked);
    const likesEl = document.getElementById('listingLikesCount');
    if (likesEl && currentListingDetailId === listingId) likesEl.textContent = String(optimisticLikesCount);
    if (optimisticLiked) {
        if (isDetailHeart || isCardHeart) pulseBtn();
        if (isCardHeart) pendingHeartPulses.add(listingId);
    }
    const updatedOptimistic = updateHomeCardLikeUi(optimisticLikesCount) || updateVipRowLikeUi(optimisticLikesCount);
    if (!updatedOptimistic) renderListings();
    renderFavorites();
    pendingHeartPulses.delete(listingId);
    showToast(optimisticLiked ? 'Liked' : 'Unliked', 'heart');

    const { data, error } = await client.rpc('toggle_listing_like', { p_listing_id: listingId });
    if (error) {
        const msg = String(error?.message || '');
        if (isListingLikesBackendMissing(error)) {
            showToast('Listing likes backend is not set up yet', 'alert-circle');
        } else if (msg.toLowerCase().includes('likes_count') && msg.toLowerCase().includes('ambiguous')) {
            showToast('Update Supabase function toggle_listing_like (likes_count ambiguity).', 'alert-circle');
        } else {
            showToast(error.message || 'Failed to like listing', 'alert-circle');
        }
        favorites = favorites.filter((x) => x !== listingId);
        if (wasLiked) favorites.push(listingId);
        if (item) item.likes_count = prevLikesCount;
        btn?.classList?.toggle('active', wasLiked);
        if (likesEl && currentListingDetailId === listingId) likesEl.textContent = String(prevLikesCount);
        pendingHeartPulses.delete(listingId);
        const updatedRollback = updateHomeCardLikeUi(prevLikesCount) || updateVipRowLikeUi(prevLikesCount);
        if (!updatedRollback) renderListings();
        renderFavorites();
        return;
    }

    const payload = Array.isArray(data) ? data[0] : data;
    const hasServerCount = payload && (payload.likes_count !== undefined && payload.likes_count !== null);
    const likesCount = hasServerCount ? (Number(payload.likes_count) || 0) : optimisticLikesCount;
    await refreshFavoritesFromSupabase({ silent: true });
    const likedNow = favorites.includes(listingId);
    if (!wasLiked && likedNow && item?.owner_id) {
        createNotificationFromClient({ recipientId: item.owner_id, type: 'listing_like', listingId: listingId });
    }
    if (item) item.likes_count = likesCount;
    if (likesEl && currentListingDetailId === listingId) likesEl.textContent = String(likesCount);
    btn?.classList?.toggle('active', likedNow);
    await refreshListingCountsFromSupabase(listingId, { render: false });
    const updatedFinal = updateHomeCardLikeUi(likesCount) || updateVipRowLikeUi(likesCount);
    if (!updatedFinal) renderListings();
    renderFavorites();
}

function getListingImagesForDetail(item) {
    const urls = [];
    const push = (u) => {
        const v = String(u || '').trim();
        if (!v) return;
        if (!urls.includes(v)) urls.push(v);
    };
    if (Array.isArray(item?.images)) item.images.forEach(push);
    push(item?.image);
    return urls;
}

function getListingImagesForCard(item) {
    const urls = [];
    const push = (u) => {
        const v = String(u || '').trim();
        if (!v) return;
        if (!urls.includes(v)) urls.push(v);
    };
    if (Array.isArray(item?.cardImages) && item.cardImages.length) item.cardImages.forEach(push);
    push(item?.cardImage);
    if (!urls.length) {
        if (Array.isArray(item?.images)) item.images.forEach(push);
        push(item?.image);
    }
    return urls;
}

function isDesktopListingDetailLayout() {
    try {
        return !!(window.matchMedia && window.matchMedia('(min-width: 1000px)').matches);
    } catch (e) {
        return false;
    }
}

function getListingDetailCarouselColumns(slidesCount) {
    const count = Math.max(0, Number(slidesCount) || 0);
    if (isDesktopListingDetailLayout() && count >= 2) return 2;
    return 1;
}

async function fetchListingDetailFromSupabase(listingId, { includeProfiles = true } = {}) {
    const client = initSupabase();
    if (!client) return null;
    const id = Number(listingId) || 0;
    if (!id) return null;
    const baseSelect = 'id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, listing_images(url, thumbnail_url, sort_order)';
    const embeddedSelect = `${baseSelect}, profiles(id, display_name, tag, avatar_url, verified, is_vip)`;
    let data = null;
    let error = null;
    let profilesById = {};

    {
        const q = client
            .from('listings')
            .select(includeProfiles ? embeddedSelect : baseSelect)
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();
        const res = await q;
        data = res.data;
        error = res.error;
    }

    if (error && includeProfiles) {
        const q = client
            .from('listings')
            .select(baseSelect)
            .eq('id', id)
            .is('deleted_at', null)
            .maybeSingle();
        const res = await q;
        data = res.data;
        error = res.error;
        const ownerId = data?.owner_id || null;
        profilesById = ownerId ? await fetchProfilesByIds([ownerId]) : {};
    }

    if (error || !data) return null;
    return mapSupabaseListingRow(data, profilesById);
}

async function openListingDetailFromSupabase(listingId, { pushState = true } = {}) {
    const id = Number(listingId) || 0;
    if (!id) return;
    currentListingDetailId = id;
    if (pushState) {
        const from = getActiveSectionId();
        const url = new URL(window.location.href);
        url.searchParams.delete('new');
        url.searchParams.set('listing', String(id));
        history.pushState({ __winjay: true, view: 'listing', listingId: id, from }, '', url.pathname + url.search);
    }
    showSection('listing-detail-section');
    const content = document.getElementById('listingDetailPage');
    if (content) content.innerHTML = getListingDetailSkeletonHTML();
    const fetched = await fetchListingDetailFromSupabase(id, { includeProfiles: true });
    if (!fetched) {
        showToast('Listing not found', 'alert-circle');
        return;
    }
    if (currentListingDetailId !== id) return;
    const byId = new Map((listings || []).map((x) => [x.id, x]));
    const existing = byId.get(id) || null;
    if (existing?.reviewsData) fetched.reviewsData = existing.reviewsData;
    byId.set(id, fetched);
    listings = Array.from(byId.values());
    openListingDetail(id, { pushState: false });
}

async function fetchSimilarListingsFromSupabase(seedItem, { includeProfiles = true, limit = 8 } = {}) {
    const client = initSupabase();
    if (!client) return [];
    const seed = seedItem && typeof seedItem === 'object' ? seedItem : null;
    const seedId = Number(seed?.id) || 0;
    if (!seedId) return [];
    const safeLimit = Math.max(1, Math.min(16, Number(limit) || 8));
    const baseSelect = 'id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, listing_images(url, thumbnail_url, sort_order)';
    const embeddedSelect = `${baseSelect}, profiles(id, display_name, tag, avatar_url, verified, is_vip)`;

    const applyCriteria = (q) => {
        q = applyActiveListingsOnly(q);
        q = q.neq('id', seedId);
        if (seed?.subcategory) {
            q = q.eq('subcategory', String(seed.subcategory));
        } else if (seed?.category) {
            const rawCats = getRawCategoriesForNormalizedCategory(String(seed.category));
            if (rawCats.length === 1) q = q.eq('category', rawCats[0]);
            else if (rawCats.length > 1) q = q.in('category', rawCats);
            else q = q.eq('category', String(seed.category));
        }
        if (seed?.wilaya) q = q.eq('wilaya', String(seed.wilaya));
        q = q.order('created_at', { ascending: false });
        q = q.order('id', { ascending: false });
        q = q.limit(safeLimit);
        return q;
    };

    let data = null;
    let error = null;
    let profilesById = {};
    {
        const q = applyCriteria(client.from('listings').select(includeProfiles ? embeddedSelect : baseSelect));
        const res = await q;
        data = res.data;
        error = res.error;
    }
    if (error && includeProfiles) {
        const q = applyCriteria(client.from('listings').select(baseSelect));
        const res = await q;
        data = res.data;
        error = res.error;
        const ownerIds = Array.from(new Set((data || []).map((r) => r?.owner_id).filter(Boolean)));
        profilesById = ownerIds.length ? await fetchProfilesByIds(ownerIds) : {};
    }
    if (error) return [];
    return (data || []).map((row) => mapSupabaseListingRow(row, profilesById)).slice(0, safeLimit);
}

async function hydrateSimilarListingsForListingDetail(listingId) {
    if (DEMO_MODE) return;
    const id = Number(listingId) || 0;
    if (!id) return;
    const wrap = document.getElementById('similarListingsWrap');
    const grid = document.getElementById('similarListingsGrid');
    if (!wrap || !grid) return;
    const item = listings.find((l) => l?.id === id) || null;
    if (!item) return;
    if (currentListingDetailId !== id) return;
    const cached = listingSimilarCache.get(id) || null;
    if (Array.isArray(cached)) {
        if (!cached.length) {
            wrap.style.display = 'none';
            return;
        }
        wrap.style.display = 'block';
        grid.innerHTML = cached.map((x) => createCardHTML(x)).join('');
        scheduleLucideCreateIcons(grid);
        return;
    }
    const fetched = await fetchSimilarListingsFromSupabase(item, { includeProfiles: true, limit: 8 });
    listingSimilarCache.set(id, fetched);
    if (currentListingDetailId !== id) return;
    if (!fetched.length) {
        wrap.style.display = 'none';
        return;
    }
    wrap.style.display = 'block';
    grid.innerHTML = fetched.map((x) => createCardHTML(x)).join('');
    scheduleLucideCreateIcons(grid);
}

function openListingDetail(listingId, { pushState = true } = {}) {
    const item = listings.find(l => l.id === listingId);
    if (!item) {
        if (!DEMO_MODE) {
            void openListingDetailFromSupabase(listingId, { pushState });
        }
        return;
    }
    currentListingDetailId = listingId;
    trackAnalyticsEvent('listing_open', {
        listingId,
        category: item?.category || null,
        wilaya: item?.wilaya || null,
        dedupeKey: `listing_open:${listingId || ''}:${getAnalyticsSessionId()}`
    });
    if (pushState) {
        const from = getActiveSectionId();
        const url = new URL(window.location.href);
        url.searchParams.delete('new');
        url.searchParams.set('listing', String(listingId));
        history.pushState({ __winjay: true, view: 'listing', listingId, from }, '', url.pathname + url.search);
    }
    showSection('listing-detail-section');
    if (!DEMO_MODE) {
        item.reviewsData = listingReviewsCache.get(listingId) || [];
    } else if (!Array.isArray(item.reviewsData)) {
        item.reviewsData = [];
    }
    const content = document.getElementById('listingDetailPage');
    if (!content) return;
    const seller = item.seller || { name: "Utilisateur Endinar", tag: "@user", pic: DEFAULT_AVATAR_SVG, verified: false, rating: 0, reviews: 0, reviewsData: [] };
    const isLiked = favorites.includes(listingId);
    const pulse = pendingHeartPulses.has(listingId) && isLiked;
    const detailImages = getListingImagesForDetail(item);
    const selectedIdxRaw = listingDetailImageIndex[listingId] ?? 0;
    const mainImageUrl = detailImages[0] || item.image;
    const videoMeta = getListingVideoMeta(item);
    let listingVideoUrl = videoMeta.url;
    if (!listingVideoUrl && videoMeta.path) {
        try {
            const client = initSupabase();
            const { data: publicData } = client.storage.from(LISTING_VIDEOS_BUCKET).getPublicUrl(videoMeta.path);
            listingVideoUrl = publicData?.publicUrl || '';
        } catch (e) {
            listingVideoUrl = '';
        }
    }
    const hasDetailVideo = !!listingVideoUrl;
    const detailSlidesCount = (hasDetailVideo ? 1 : 0) + detailImages.length;
    const detailColumns = getListingDetailCarouselColumns(detailSlidesCount);
    const detailMaxIndex = Math.max(0, detailSlidesCount - detailColumns);
    const selectedIdxClamped = Math.max(0, Math.min(detailMaxIndex, Number(selectedIdxRaw) || 0));
    listingDetailImageIndex[listingId] = selectedIdxClamped;
    const detailDotsCount = detailMaxIndex + 1;
    const detailCarouselHtml = (hasDetailVideo || detailImages.length > 1)
        ? `<div class="detail-carousel js-carousel" data-carousel="detail" data-columns="${detailColumns}" data-listing-id="${listingId}" data-index="${selectedIdxClamped}" data-video-ready="0" data-sound-gate="0">
                <button type="button" class="carousel-arrow prev" aria-label="Previous image"><i data-lucide="chevron-left"></i></button>
                <div class="carousel-viewport">
                    <div class="carousel-track">
                        ${hasDetailVideo ? `<div class="carousel-slide"><video class="detail-video" data-detail-video="1" src="${listingVideoUrl}" ${detailImages[0] ? `poster="${detailImages[0]}"` : ''} playsinline controls preload="metadata"></video></div>` : ''}
                        ${detailImages.map((u) => `<div class="carousel-slide"><img src="${u}" data-src="${u}" class="detail-image" alt="${escapeHtml(item.title)}" loading="lazy" decoding="async" draggable="false"></div>`).join('')}
                    </div>
                </div>
                <button type="button" class="carousel-arrow next" aria-label="Next image"><i data-lucide="chevron-right"></i></button>
                ${hasDetailVideo ? `<div class="vip-video-loader" aria-hidden="true"></div><button type="button" class="listing-video-sound-gate" aria-label="Lancer la vidéo"><i data-lucide="play"></i><span>Lancer la vidéo</span></button>` : ''}
                <div class="carousel-dots">
                    ${Array.from({ length: detailDotsCount }, (_, i) => `<button type="button" class="carousel-dot ${i === selectedIdxClamped ? 'active' : ''}" data-dot-index="${i}"></button>`).join('')}
                </div>
            </div>`
        : `<div class="detail-carousel">
                <div class="carousel-viewport">
                    <img id="detailMainImage" src="${mainImageUrl}" data-src="${mainImageUrl}" class="detail-image" alt="${escapeHtml(item.title)}" onclick="openLightbox('${mainImageUrl}')">
                </div>
            </div>`;
    const bestListingReview = item.reviewsData.length > 0 ? item.reviewsData[0] : null;
    const similarListings = DEMO_MODE ? getSimilarListings(item) : [];
    const reviewsCount = item.reviewsData.length;
    const reviewsExpanded = !!listingReviewPanelState[listingId];
    const similarHTML = DEMO_MODE
        ? (similarListings.length > 0 ? `
        <div class="similar-listings">
            <h3>Annonces similaires</h3>
            <div class="listings-grid">
                ${similarListings.map((s) => createCardHTML(s)).join('')}
            </div>
        </div>` : '')
        : `
        <div class="similar-listings" id="similarListingsWrap">
            <h3>Annonces similaires</h3>
            <div class="listings-grid" id="similarListingsGrid">${getHomeListingsSkeletonHTML(8)}</div>
        </div>`;
    const phoneDigits = item.contact_phone ? String(item.contact_phone).replace(/[^0-9]/g, '') : '';
    content.innerHTML = `
        <div class="detail-container">
            <div class="detail-head">
                <h2>${item.title} <span class="listing-status-badge ${String(item.availability || 'Available').toLowerCase() === 'sold' ? 'sold' : (String(item.availability || 'Available').toLowerCase() === 'reserved' ? 'pending' : 'ok')}">${escapeHtml(item.availability || 'Available')}</span></h2>
                <div class="detail-price">${(item.price_type === 'Free' || Number(item.price) === 0) ? 'Free' : `${new Intl.NumberFormat('fr-DZ').format(item.price)} DZD`}</div>
            </div>
            <div class="detail-hero">
                <div class="detail-gallery">
                    ${detailCarouselHtml}
                </div>
                <div class="detail-sidebar">
                    <div class="detail-sidebar-card">
                        <div class="detail-sidebar-meta">
                            <div class="detail-sidebar-meta-row"><i data-lucide="map-pin"></i> ${escapeHtml(item.location || '—')}</div>
                            ${item.subcategory || item.category ? `<div class="detail-sidebar-meta-row"><i data-lucide="tag"></i> ${escapeHtml(item.subcategory ? `${item.category} · ${item.subcategory}` : item.category)}</div>` : ''}
                        </div>
                        <div class="seller-card" onclick="openSellerProfileByOwnerId('${item.owner_id}')">
                            <div class="seller-info">
                                <img id="listingSellerAvatar" src="${seller.pic || seller.profilePic}" class="seller-avatar">
                                <div>
                                    <div class="seller-name" id="listingSellerName">${seller.name} ${getUserBadgesHTML(seller)}</div>
                                    <div class="seller-tag" id="listingSellerTag">${seller.tag}</div>
                                    <div id="listingSellerRating">${getRatingHTML(seller.rating || 0, seller.reviews || 0, { showEmpty: true })}</div>
                                </div>
                            </div>
                            <i data-lucide="chevron-right"></i>
                        </div>
                        <div class="detail-contact-actions">
                            <button class="message-contact-btn" onclick="startChatWithSellerByOwnerId('${item.owner_id}', ${item.id})">
                                <i data-lucide="message-circle" style="width: 18px; height: 18px;"></i>
                                Message
                            </button>
                            ${item.contact_phone ? `<a class="call-contact-btn" href="tel:${String(item.contact_phone).replace(/[^0-9+]/g, '')}" onclick="trackListingContactAction('call', ${item.id}); event.stopPropagation();"><i data-lucide="phone-call" style="width: 18px; height: 18px;"></i> Appeler</a>` : ''}
                            ${item.contact_phone && phoneDigits ? `<a class="call-contact-btn" href="https://wa.me/${phoneDigits}" target="_blank" rel="noopener" onclick="trackListingContactAction('whatsapp', ${item.id}); event.stopPropagation();"><i data-lucide="message-square" style="width: 18px; height: 18px;"></i> WhatsApp</a>` : ''}
                        </div>
                    </div>
                </div>
            </div>
            <div class="detail-body">
                <div class="detail-kv-grid">
                    <div class="kv-card">
                        <div class="kv-card-head">
                            <div class="kv-card-title"><i data-lucide="file-text"></i> Informations de l'annonce</div>
                        </div>
                        <div class="kv-rows">
                            <div class="kv-row">
                                <div class="kv-label">Numéro</div>
                                <div class="kv-value">${escapeHtml(String(item.id ?? '—'))}</div>
                            </div>
                            <div class="kv-row">
                                <div class="kv-label">Date</div>
                                <div class="kv-value">${escapeHtml(String(item.date || '—'))}</div>
                            </div>
                            <div class="kv-row">
                                <div class="kv-label">Localisation</div>
                                <div class="kv-value">${escapeHtml(item.location || '—')}</div>
                            </div>
                            <div class="kv-row">
                                <div class="kv-label">Catégorie</div>
                                <div class="kv-value">${escapeHtml(item.subcategory ? `${item.category} · ${item.subcategory}` : (item.category || '—'))}</div>
                            </div>
                        </div>
                    </div>
                    <div class="kv-card">
                        <div class="kv-card-head">
                            <div class="kv-card-title"><i data-lucide="list-check"></i> Détails</div>
                        </div>
                        <div class="kv-rows">
                            ${renderListingDetailsCardRows(item)}
                        </div>
                    </div>
                    <div class="kv-card">
                        <div class="kv-card-head">
                            <div class="kv-card-title"><i data-lucide="badge-dollar-sign"></i> Prix</div>
                        </div>
                        <div class="kv-rows">
                            <div class="kv-row">
                                <div class="kv-label">Type</div>
                                <div class="kv-value">${escapeHtml(item.price_type || '—')}</div>
                            </div>
                            <div class="kv-row">
                                <div class="kv-label">Montant</div>
                                <div class="kv-value">${(item.price_type === 'Free' || Number(item.price) === 0) ? 'Free' : `${new Intl.NumberFormat('fr-DZ').format(item.price)} DZD`}</div>
                            </div>
                        </div>
                    </div>
                    <div class="kv-card">
                        <div class="kv-card-head">
                            <div class="kv-card-title"><i data-lucide="bar-chart-3"></i> Statistiques</div>
                        </div>
                        <div class="kv-rows">
                            <div class="kv-row">
                                <div class="kv-label">Vues</div>
                                <div class="kv-value"><span id="listingViewsCount">${Number(item.views_count) || 0}</span></div>
                            </div>
                            <div class="kv-row">
                                <div class="kv-label">Likes</div>
                                <div class="kv-value kv-value-actions">
                                    <button class="detail-like-btn ${isLiked ? 'active' : ''} ${pulse ? 'pulse' : ''}" type="button" onclick="toggleFavorite(event, ${item.id})" title="Like">
                                        <i data-lucide="heart"></i>
                                        <span id="listingLikesCount">${Number(item.likes_count) || 0}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    ${item.contact_phone ? `
                    <div class="kv-card">
                        <div class="kv-card-head">
                            <div class="kv-card-title"><i data-lucide="phone"></i> Contact</div>
                        </div>
                        <div class="kv-rows">
                            <div class="kv-row">
                                <div class="kv-label">Téléphone</div>
                                <div class="kv-value kv-value-actions kv-value-with-copy">
                                    <span>${escapeHtml(item.contact_phone)}</span>
                                    <button class="kv-copy-btn" type="button" onclick="event.stopPropagation(); copyPhoneNumber('${escapeJsString(item.contact_phone)}')" title="Copier le numéro">
                                        <i data-lucide="copy"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>` : ''}
                </div>
                ${item.description ? `<div class="detail-description"><h3>Description</h3><p>${escapeHtml(item.description)}</p></div>` : ''}
                <div id="listingReviewHighlightWrap">
                    ${bestListingReview ? `
                    <div class="review-highlight clickable" onclick="expandListingReviews(${item.id})">
                        <div class="highlight-label"><i data-lucide="message-circle" style="width: 14px; height: 14px;"></i> Avis sur l'annonce</div>
                        <div class="highlight-content">"${bestListingReview.comment}"</div>
                        <div class="highlight-author">— ${escapeHtml(bestListingReview.user || '')}</div>
                    </div>` : ''}
                </div>
                <div class="share-section">
                    <h3>Partager cette annonce</h3>
                    <div class="share-buttons">
                        <button class="share-btn share-whatsapp" onclick="shareListing('whatsapp', ${item.id})" title="Partager sur WhatsApp">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </button>
                        <button class="share-btn share-facebook" onclick="shareListing('facebook', ${item.id})" title="Partager sur Facebook">
                            <svg viewBox="0 0 24 24" fill="currentColor" style="width: 24px; height: 24px;"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                        </button>
                        <button class="share-btn share-copy" onclick="shareListing('copy', ${item.id})" title="Copier le lien"><i data-lucide="copy"></i></button>
                    </div>
                </div>
                <div class="listing-reviews-accordion">
                    <button class="listing-reviews-toggle" type="button" onclick="toggleListingReviews(${item.id})">
                        <i data-lucide="message-circle"></i>
                        <span>Avis sur l'annonce</span>
                        <span class="listing-reviews-count" id="listingReviewsCount">${reviewsCount}</span>
                        <i class="chev" data-lucide="${reviewsExpanded ? 'chevron-up' : 'chevron-down'}"></i>
                    </button>
                    <div id="listingReviewsPanel" class="listing-reviews-panel ${reviewsExpanded ? 'active' : ''}">
                        <div class="reviews-section" style="margin-top: 0;">
                            <h3>Laisser un avis sur cette annonce</h3>
                            <div class="review-form">
                                <select id="listingReviewRating">
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Très bien</option>
                                    <option value="3">3 - Correct</option>
                                    <option value="2">2 - Moyen</option>
                                    <option value="1">1 - Mauvais</option>
                                </select>
                                <textarea id="listingReviewComment" rows="3" placeholder="Votre commentaire sur cette annonce..."></textarea>
                                <button class="submit-btn" type="button" onclick="addListingReview(${item.id})">Publier l'avis</button>
                            </div>
                            <h3 style="margin-top:18px;">Avis sur l'annonce</h3>
                            <div class="reviews-list" id="listingReviewsList">${getReviewsListHTML(item.reviewsData || [], seller?.name || 'Vendeur', false, 'listing', String(item.id))}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>${similarHTML}`;
    const detailCarousel = content.querySelector(`.js-carousel[data-carousel="detail"][data-listing-id="${Number(listingId) || 0}"]`);
    const detailVideo = detailCarousel ? detailCarousel.querySelector('video.detail-video[data-detail-video="1"]') : null;
    if (detailCarousel && detailVideo) {
        const gateBtn = detailCarousel.querySelector('.listing-video-sound-gate');
        if (gateBtn && !gateBtn.dataset.bound) {
            gateBtn.dataset.bound = '1';
            gateBtn.addEventListener('click', (e) => {
                try {
                    e.preventDefault();
                    e.stopPropagation();
                } catch (err) {
                    null;
                }
                try {
                    const p = detailVideo.play();
                    if (p && typeof p.catch === 'function') p.catch(() => null);
                } catch (err) {
                    null;
                }
                detailCarousel.dataset.soundGate = '0';
            });
        }
        try {
            detailVideo.muted = false;
            detailVideo.volume = 1;
        } catch (err) {
            null;
        }
        try {
            const p = detailVideo.play();
            if (p && typeof p.then === 'function') {
                p.then(() => {
                    if (currentListingDetailId !== listingId) return;
                    detailCarousel.dataset.soundGate = '0';
                }).catch(() => {
                    if (currentListingDetailId !== listingId) return;
                    detailCarousel.dataset.soundGate = '1';
                });
            }
        } catch (err) {
            detailCarousel.dataset.soundGate = '1';
        }
        const ready = () => {
            if (currentListingDetailId !== listingId) return;
            detailCarousel.dataset.videoReady = '1';
        };
        detailVideo.addEventListener('canplay', ready, { once: true });
        detailVideo.addEventListener('loadeddata', ready, { once: true });
        detailVideo.addEventListener('error', ready, { once: true });
    }
    initCarouselsInContainer(content);
    scheduleLucideCreateIcons();
    refreshListingReviewsForListingDetail(listingId, seller?.name || 'Vendeur');
    if (!DEMO_MODE) {
        void hydrateSimilarListingsForListingDetail(listingId);
    }
    if (!listingDetailViewRecorded || listingDetailViewRecordedListingId !== listingId) {
        listingDetailViewRecordedListingId = listingId;
        listingDetailViewRecorded = true;
        recordListingView(listingId);
    }
    if (!DEMO_MODE) {
        fetchProfileRatingSummary(item.owner_id).then((summary) => {
            if (currentListingDetailId !== listingId) return;
            const sellerRatingEl = document.getElementById('listingSellerRating');
            if (!sellerRatingEl) return;
            sellerRatingEl.innerHTML = getRatingHTML(summary.rating, summary.reviews, { showEmpty: true });
            scheduleLucideCreateIcons();
        });
    }
    hydrateListingSellerInfo(listingId);
}

function shouldHydrateListingSeller(seller) {
    if (!seller) return true;
    const name = String(seller.name || '').trim();
    const tag = String(seller.tag || '').trim();
    if (!name || name === 'Seller') return true;
    if (!tag || isAutoGeneratedTag(tag)) return true;
    return false;
}

async function hydrateListingSellerInfo(listingId) {
    if (DEMO_MODE) return;
    const item = listings.find((l) => l?.id === listingId);
    if (!item?.owner_id) return;
    if (!shouldHydrateListingSeller(item.seller)) return;
    const profilesById = await fetchProfilesByIds([item.owner_id]);
    const profileRow = profilesById?.[item.owner_id] || null;
    if (!profileRow?.id) return;
    const prev = item.seller || {};
    const next = mapProfileRowToSeller(profileRow);
    item.seller = {
        ...prev,
        ...next,
        rating: Number(prev.rating) || Number(next.rating) || 0,
        reviews: Number(prev.reviews) || Number(next.reviews) || 0
    };
    if (currentListingDetailId !== listingId) return;
    const avatarEl = document.getElementById('listingSellerAvatar');
    if (avatarEl && (item.seller.pic || item.seller.profilePic)) {
        avatarEl.src = item.seller.pic || item.seller.profilePic;
    }
    const nameEl = document.getElementById('listingSellerName');
    if (nameEl) {
        nameEl.innerHTML = `${escapeHtml(item.seller.name || '')} ${getUserBadgesHTML(item.seller)}`;
    }
    const tagEl = document.getElementById('listingSellerTag');
    if (tagEl) tagEl.textContent = item.seller.tag || '';
    scheduleLucideCreateIcons();
}

function shareListing(platform, id) {
    const item = listings.find(l => l.id === id);
    if (!item) return;
    const url = window.location.href;
    const text = `Regardez cette annonce sur endinar.com : ${item.title}`;
    if (platform === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text + ' ' + url)}`);
        if (currentSupabaseUserId && item.owner_id) createNotificationFromClient({ recipientId: item.owner_id, type: 'listing_share', listingId: item.id, meta: { platform: 'whatsapp' } });
    } else if (platform === 'facebook') {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        if (currentSupabaseUserId && item.owner_id) createNotificationFromClient({ recipientId: item.owner_id, type: 'listing_share', listingId: item.id, meta: { platform: 'facebook' } });
    } else if (platform === 'copy') {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Lien copié dans le presse-papier !', 'copy');
            if (currentSupabaseUserId && item.owner_id) createNotificationFromClient({ recipientId: item.owner_id, type: 'listing_share', listingId: item.id, meta: { platform: 'copy' } });
        });
    }
}

async function shareMyProfile() {
    if (!isLoggedIn()) {
        openModal('loginModal');
        return;
    }
    const tag = userProfile.tag || '';
    const url = `${window.location.origin}${window.location.pathname}?profile=${encodeURIComponent(tag)}`;
    const text = `Check my profile on endinar.com: ${userProfile.name} (${tag})`;
    try {
        if (navigator.share) {
            await navigator.share({ title: 'endinar.com', text, url });
            return;
        }
    } catch (e) {
        null;
    }
    const ok = await copyTextToClipboard(url);
    showToast(ok ? 'Link copied!' : 'Unable to copy link', ok ? 'copy' : 'alert-circle');
}

async function shareSellerProfile(ownerId, tag, name) {
    if (!isLoggedIn()) {
        openModal('loginModal');
        return;
    }
    const safeTag = String(tag || '').trim();
    const label = String(name || '').trim() || safeTag || 'profile';
    const url = `${window.location.origin}${window.location.pathname}?profile=${encodeURIComponent(safeTag)}`;
    const text = `Check this profile on endinar.com: ${label} (${safeTag})`;
    let shared = false;
    try {
        if (navigator.share) {
            await navigator.share({ title: 'endinar.com', text, url });
            shared = true;
        }
    } catch (e) {
        shared = false;
    }
    if (!shared) {
        const ok = await copyTextToClipboard(url);
        showToast(ok ? 'Link copied!' : 'Unable to copy link', ok ? 'copy' : 'alert-circle');
        shared = ok;
    }
    if (shared && ownerId) await createNotificationFromClient({ recipientId: ownerId, type: 'profile_share', targetProfileId: ownerId, meta: { platform: 'share' } });
}

async function ensureSellerProfileReviewsLoaded(ownerId) {
    const id = String(ownerId || '').trim();
    if (!id) return [];
    if (sellerProfileReviewsCache.has(id)) return sellerProfileReviewsCache.get(id) || [];
    const rows = await fetchProfileReviews(id);
    sellerProfileReviewsCache.set(id, rows);
    const summary = computeRatingSummaryFromReviews(rows);
    profileRatingSummaryCache.set(id, summary);
    const ratingEl = document.getElementById('sellerProfileRatingContainer');
    if (ratingEl) ratingEl.innerHTML = getRatingHTML(summary.rating, summary.reviews);
    const listEl = document.getElementById('sellerProfileReviewsList');
    if (listEl) listEl.innerHTML = getReviewsListHTML(rows, currentSellerProfileName || 'Seller', false, 'profile', currentSellerProfileTag || '');
    scheduleLucideCreateIcons(listEl || ratingEl || document.getElementById('seller-profile-section') || document.body);
    return rows;
}

async function ensureSellerProfileCoursesLoaded(ownerId) {
    const id = String(ownerId || '').trim();
    if (!id) return [];
    if (sellerProfileCoursesCache.has(id)) return sellerProfileCoursesCache.get(id) || [];
    const client = initSupabase();
    if (!client) return [];
    const { data, error } = await client
        .from('courses')
        .select('id, owner_id, title, description, thumbnail_object_path, is_published, created_at')
        .eq('owner_id', id)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(50);
    if (error) throw error;
    const rows = Array.isArray(data) ? data : [];
    sellerProfileCoursesCache.set(id, rows);
    const listEl = document.getElementById('sellerProfileCoursesList');
    if (listEl) listEl.innerHTML = getSellerProfileCoursesHTML(rows);
    scheduleLucideCreateIcons(listEl || document.getElementById('seller-profile-section') || document.body);
    return rows;
}

function getSellerProfileCoursesHTML(rows) {
    const list = Array.isArray(rows) ? rows : [];
    if (!list.length) {
        return '<div style="text-align: center; padding: 40px; color: var(--text-muted);"><i data-lucide="graduation-cap" style="width: 48px; height: 48px; margin-bottom: 15px; opacity: 0.5;"></i><p>No courses yet.</p></div>';
    }
    const client = initSupabase();
    return list
        .map((c) => {
            const id = String(c?.id || '');
            const title = escapeHtml(String(c?.title || 'Course'));
            const desc = escapeHtml(String(c?.description || ''));
            let thumbUrl = '';
            if (client && String(c?.thumbnail_object_path || '').trim()) {
                thumbUrl = client.storage.from(COURSE_PUBLIC_BUCKET).getPublicUrl(String(c.thumbnail_object_path)).data?.publicUrl || '';
            }
            return `
                <div class="seller-course-item">
                    <div class="seller-course-left">
                        <div class="seller-course-thumb">${thumbUrl ? `<img src="${escapeHtml(thumbUrl)}" alt="">` : ''}</div>
                        <div style="min-width:0;">
                            <div class="seller-course-title">${title}</div>
                            ${desc ? `<div class="seller-course-desc">${desc}</div>` : ''}
                        </div>
                    </div>
                    <button class="admin-action-btn" type="button" onclick="openCourse('${escapeHtml(id)}', { fromSection: 'seller-profile-section' })">Open</button>
                </div>
            `;
        })
        .join('');
}

async function switchSellerProfileSection(section = 'listings') {
    const listingsTab = document.getElementById('sellerListingsTab');
    const reviewsTab = document.getElementById('sellerReviewsTab');
    const coursesTab = document.getElementById('sellerCoursesTab');
    const listingsPanel = document.getElementById('sellerListingsSection');
    const reviewsPanel = document.getElementById('sellerReviewsSection');
    const coursesPanel = document.getElementById('sellerCoursesSection');
    if (!listingsTab || !reviewsTab || !coursesTab || !listingsPanel || !reviewsPanel || !coursesPanel) return;

    const next = String(section || 'listings');
    const allowCourses = isCoursesFeatureEnabledForViewer();
    const showReviews = next === 'reviews';
    const showCourses = next === 'courses' && allowCourses;
    const showListings = next === 'listings' || (!showReviews && !showCourses);

    listingsTab.classList.toggle('active', showListings);
    coursesTab.classList.toggle('active', showCourses);
    reviewsTab.classList.toggle('active', showReviews);

    listingsPanel.classList.toggle('active', showListings);
    coursesPanel.classList.toggle('active', showCourses);
    reviewsPanel.classList.toggle('active', showReviews);

    if (showReviews && currentSellerProfileOwnerId) {
        const listEl = document.getElementById('sellerProfileReviewsList');
        if (listEl && !sellerProfileReviewsCache.has(String(currentSellerProfileOwnerId))) {
            listEl.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);"><i data-lucide="loader" style="width: 36px; height: 36px;"></i><p style="margin-top: 10px;">Loading reviews...</p></div>`;
            scheduleLucideCreateIcons(listEl);
        }
        try {
            await ensureSellerProfileReviewsLoaded(currentSellerProfileOwnerId);
        } catch (e) {
            showToast('Failed to load profile reviews', 'alert-circle');
        }
    }

    if (showCourses && currentSellerProfileOwnerId) {
        const listEl = document.getElementById('sellerProfileCoursesList');
        if (listEl && !sellerProfileCoursesCache.has(String(currentSellerProfileOwnerId))) {
            listEl.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);"><i data-lucide="loader" style="width: 36px; height: 36px;"></i><p style="margin-top: 10px;">Loading courses...</p></div>`;
            scheduleLucideCreateIcons(listEl);
        }
        try {
            await ensureSellerProfileCoursesLoaded(currentSellerProfileOwnerId);
        } catch (e) {
            showToast('Failed to load courses', 'alert-circle');
        }
    }
}

function mapProfileRowToSeller(row) {
    const id = row?.id || '';
    const pic =
        pickFirstValue(row, ['avatar_url', 'profile_pic', 'profilePic', 'picture', 'photo_url']) ||
        DEFAULT_AVATAR_SVG;
    const cover =
        pickFirstValue(row, ['cover_url', 'cover_pic', 'coverPic', 'cover_url']) || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200';
    const rawTag =
        pickFirstValue(row, ['tag', 'username', 'handle']) ||
        (id ? `@${String(id).slice(0, 8)}` : '@user');
    const tag = rawTag.startsWith('@') ? rawTag.toLowerCase() : '@' + rawTag.toLowerCase();
    return {
        id,
        name: row?.display_name || row?.name || row?.full_name || row?.username || row?.handle || 'Seller',
        tag,
        pic,
        profilePic: pic,
        cover,
        location: row?.location || 'Algeria',
        businessType: row?.business_type || row?.businessType || 'Particulier',
        joinedDate: row?.created_at
            ? new Date(row.created_at).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
            : '',
        verified: !!(row?.verified ?? row?.is_verified),
        vip: !!(row?.is_vip ?? row?.vip),
        rating: Number(row?.rating) || 0,
        reviews: Number(row?.reviews) || 0,
        reviewsData: []
    };
}

async function openSellerProfileByOwnerId(ownerId, section = 'listings') {
    if (!ownerId) return;
    if (ownerId === currentSupabaseUserId) {
        showSection('profile-section');
        switchMyProfileSection(section);
        return;
    }
    let from = getActiveSectionId();
    let fromListingId = from === 'listing-detail-section' ? currentListingDetailId : null;
    if (from === 'seller-profile-section') {
        if (String(currentSellerProfileOwnerId || '') === String(ownerId || '')) {
            closeSidebarOverlay();
            return;
        }
        const state = history.state && typeof history.state === 'object' ? history.state : null;
        const prevFrom = state?.from ? String(state.from) : '';
        const prevListingId = Number(state?.fromListingId) || 0;
        from = prevFrom && prevFrom !== 'seller-profile-section' ? prevFrom : 'home-section';
        fromListingId = from === 'listing-detail-section' && prevListingId > 0 ? prevListingId : null;
    }
    const content = document.getElementById('externalProfileContent');
    setInnerHTMLIfEmpty(content, getSellerProfileSkeletonHTML());
    const profilesById = await fetchProfilesByIds([ownerId]);
    const profileRow = profilesById[ownerId] || null;
    if (!profileRow?.id) {
        showToast('Seller profile not found', 'alert-circle');
        return;
    }
    currentSellerProfileTag = profileRow.tag || '';
    const seller = mapProfileRowToSeller(profileRow);
    currentSellerProfileOwnerId = String(profileRow.id || ownerId || '');
    currentSellerProfileName = seller.name || '';
    setSellerProfileRouteTag(seller.tag || profileRow.tag || '', { pushState: true, from, fromListingId });
    const cachedSummary = profileRatingSummaryCache.get(String(profileRow.id)) || null;
    if (cachedSummary) {
        seller.rating = cachedSummary.rating;
        seller.reviews = cachedSummary.reviews;
    } else {
        seller.rating = 0;
        seller.reviews = 0;
    }
    const sellerListings = listings.filter((l) => l?.owner_id && l.owner_id === ownerId);
    if (!content) return;
    content.innerHTML = `
        <div class="profile-header">
            <div class="cover-photo-container">
                <img src="${seller.cover || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200'}" alt="Couverture">
            </div>
            <div class="profile-info-container">
                <div class="profile-pic-wrapper">
                    <img src="${seller.pic || seller.profilePic}" alt="Profil">
                </div>
                <div class="profile-details">
                    <div class="profile-text">
                        <div class="name-badge"><h2>${seller.name}</h2> ${getUserBadgesHTML(seller)}</div>
                        <p>${seller.tag}</p>
                        <div id="sellerProfileRatingContainer">${getRatingHTML(seller.rating, seller.reviews)}</div>
                        <div class="profile-bio-box">
                            <div class="bio-item"><i data-lucide="map-pin"></i><span>${seller.location}</span></div>
                            <div class="bio-item"><i data-lucide="briefcase"></i><span>${seller.businessType}</span></div>
                            ${seller.joinedDate ? `<div class="bio-item"><i data-lucide="calendar"></i><span>Inscrit en ${seller.joinedDate}</span></div>` : ''}
                            <div class="bio-item"><i data-lucide="users"></i><span><span id="sellerFollowersCount">0</span> abonnés</span></div>
                            <div class="bio-item"><i data-lucide="user-plus"></i><span><span id="sellerFollowingCount">0</span> abonnements</span></div>
                        </div>
                    </div>
                    <div class="profile-actions-row">
                        <button class="message-contact-btn" type="button" onclick="startChatWithSellerByOwnerId('${ownerId}')">
                            <i data-lucide="message-circle" style="width: 18px; height: 18px;"></i>
                            Message
                        </button>
                        <button id="sellerFollowBtn" class="follow-profile-btn" type="button" onclick="toggleSellerFollow('${ownerId}'); event.stopPropagation();">
                            <i data-lucide="user-plus"></i>
                            <span id="sellerFollowBtnLabel">Suivre</span>
                        </button>
                        <button class="share-profile-btn" type="button" onclick="shareSellerProfile('${ownerId}', '${seller.tag}', '${escapeHtml(seller.name || '')}'); event.stopPropagation();">
                            <i data-lucide="share-2"></i>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="profile-content">
            <div class="profile-sections-switcher">
                <button class="profile-switch-btn active" id="sellerListingsTab" type="button" onclick="switchSellerProfileSection('listings')">
                    <i data-lucide="layout-grid"></i>
                    <span>Listings</span>
                </button>
                <button class="profile-switch-btn" id="sellerCoursesTab" type="button" onclick="switchSellerProfileSection('courses')">
                    <i data-lucide="graduation-cap"></i>
                    <span>Courses</span>
                </button>
                <button class="profile-switch-btn" id="sellerReviewsTab" type="button" onclick="switchSellerProfileSection('reviews')">
                    <i data-lucide="star"></i>
                    <span>Reviews</span>
                </button>
            </div>
            <div id="sellerListingsSection" class="profile-section-panel active">
                ${sellerListings.length > 0 ? `<h3>Listings from ${seller.name}</h3><div class="listings-grid">${sellerListings.map(l => createCardHTML(l)).join('')}</div>` : '<div style="text-align: center; padding: 40px; color: var(--text-muted);"><i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin-bottom: 15px; opacity: 0.5;"></i><p>No listings yet.</p></div>'}
            </div>
            <div id="sellerCoursesSection" class="profile-section-panel">
                <h3>Courses by ${seller.name}</h3>
                <div id="sellerProfileCoursesList"></div>
            </div>
            <div id="sellerReviewsSection" class="profile-section-panel">
                <div class="reviews-section">
                    <h3>Leave a review on ${seller.name}</h3>
                    <div class="review-form">
                        <select id="sellerProfileReviewRating">
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Very good</option>
                            <option value="3">3 - Ok</option>
                            <option value="2">2 - Bad</option>
                            <option value="1">1 - Very bad</option>
                        </select>
                        <textarea id="sellerProfileReviewComment" rows="3" placeholder="Your comment..."></textarea>
                    <button class="submit-btn" type="button" onclick="addProfileReviewById('${ownerId}','seller-profile')">Post review</button>
                    </div>
                <h3 style="margin-top:18px;">Reviews about ${seller.name}</h3>
                <div class="reviews-list" id="sellerProfileReviewsList">${getReviewsListHTML([], seller.name, false, 'profile', seller.tag)}</div>
                </div>
            </div>
        </div>`;
    showSection('seller-profile-section');
    applyCoursesFeatureVisibility();
    applyLiveSocialShoppingFeatureVisibility();
    try {
        const sellerGrid = content.querySelector('#sellerListingsSection .listings-grid');
        if (sellerGrid) initCarouselsInContainer(sellerGrid);
    } catch (e) {
        null;
    }
    switchSellerProfileSection(section);
    initSellerProfileFollowUI(ownerId);
    fetchProfileRatingSummary(profileRow.id).then((summary) => {
        if (String(currentSellerProfileOwnerId || '') !== String(profileRow.id || '')) return;
        profileRatingSummaryCache.set(String(profileRow.id), summary);
        const el = document.getElementById('sellerProfileRatingContainer');
        if (el) el.innerHTML = getRatingHTML(summary.rating, summary.reviews);
        scheduleLucideCreateIcons(el || document.getElementById('seller-profile-section') || document.body);
    });
    scheduleLucideCreateIcons(content);
}

const sellerProfileListingsCache = new Map();

async function fetchSellerProfileListingsFromSupabase(ownerId, profileRow, { limit = 80 } = {}) {
    const id = String(ownerId || '').trim();
    if (!id) return [];
    try {
        const cached = sellerProfileListingsCache.get(id);
        if (Array.isArray(cached)) return cached;
    } catch (e) {
        null;
    }
    if (DEMO_MODE) {
        sellerProfileListingsCache.set(id, []);
        return [];
    }
    const client = initSupabase();
    if (!client) return [];
    const baseSelect = 'id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, details, listing_images(url, thumbnail_url, sort_order)';
    const safeLimit = Math.max(1, Math.min(200, Number(limit) || 80));
    const { data, error } = await client
        .from('listings')
        .select(baseSelect)
        .eq('owner_id', id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(safeLimit);
    if (error) return [];
    const profilesById = profileRow?.id ? { [id]: profileRow } : {};
    const mapped = (Array.isArray(data) ? data : []).map((row) => mapSupabaseListingRow(row, profilesById));
    sellerProfileListingsCache.set(id, mapped);
    return mapped;
}

async function openSellerProfile(tag, section = 'listings', { pushState = true } = {}) {
    currentSellerProfileTag = tag;
    if (tag === userProfile.tag) {
        showSection('profile-section');
        switchMyProfileSection(section);
        return;
    }
    const content = document.getElementById('externalProfileContent');
    setInnerHTMLIfEmpty(content, getSellerProfileSkeletonHTML());
    const profileRow = await fetchProfileByTag(tag);
    if (!profileRow?.id) {
        showToast('Seller profile not found', 'alert-circle');
        if (content) {
            content.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i data-lucide="user-x" style="width: 44px; height: 44px;"></i><p style="margin-top: 12px;">Profile not found.</p></div>`;
            scheduleLucideCreateIcons(content);
        }
        return;
    }
    const seller = mapProfileRowToSeller(profileRow);
    let from = getActiveSectionId();
    let fromListingId = from === 'listing-detail-section' ? currentListingDetailId : null;
    if (from === 'seller-profile-section') {
        const state = history.state && typeof history.state === 'object' ? history.state : null;
        const prevFrom = state?.from ? String(state.from) : '';
        const prevListingId = Number(state?.fromListingId) || 0;
        from = prevFrom && prevFrom !== 'seller-profile-section' ? prevFrom : 'home-section';
        fromListingId = from === 'listing-detail-section' && prevListingId > 0 ? prevListingId : null;
    }
    setSellerProfileRouteTag(seller.tag || profileRow.tag || '', { pushState, from, fromListingId });
    currentSellerProfileOwnerId = String(profileRow.id || '');
    currentSellerProfileName = seller.name || '';
    const cachedSummary = profileRatingSummaryCache.get(String(profileRow.id)) || null;
    if (cachedSummary) {
        seller.rating = cachedSummary.rating;
        seller.reviews = cachedSummary.reviews;
    } else {
        seller.rating = 0;
        seller.reviews = 0;
    }
    if (!content) return;
    const ownerId = String(profileRow.id || '').trim();
    let sellerListings = [];
    try {
        const cached = sellerProfileListingsCache.get(ownerId);
        if (Array.isArray(cached) && cached.length) sellerListings = cached;
    } catch (e) {
        null;
    }
    if (!sellerListings.length) {
        sellerListings = listings.filter((l) => l?.owner_id && String(l.owner_id) === ownerId);
    }
    const shouldFetchListings = !DEMO_MODE && !!ownerId && !sellerProfileListingsCache.has(ownerId);
    const listingsBlock = sellerListings.length > 0
        ? `<h3>Annonces de ${seller.name}</h3><div class="listings-grid">${sellerListings.map(l => createCardHTML(l)).join('')}</div>`
        : (shouldFetchListings
            ? `<h3>Annonces de ${seller.name}</h3><div class="listings-grid">${Array.from({ length: 8 }, () => `<div class="skeleton-card"></div>`).join('')}</div>`
            : '<div style="text-align: center; padding: 40px; color: var(--text-muted);"><i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin-bottom: 15px; opacity: 0.5;"></i><p>Cet utilisateur n\'a pas encore d\'annonces publiées.</p></div>');
    content.innerHTML = `
        <div class="profile-header">
            <div class="cover-photo-container">
                <img src="${seller.cover || 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200'}" alt="Couverture">
            </div>
            <div class="profile-info-container">
                <div class="profile-pic-wrapper">
                    <img src="${seller.pic || seller.profilePic}" alt="Profil">
                </div>
                <div class="profile-details">
                    <div class="profile-text">
                        <div class="name-badge"><h2>${seller.name}</h2> ${getUserBadgesHTML(seller)}</div>
                        <p>${seller.tag}</p>
                        <div id="sellerProfileRatingContainer">${getRatingHTML(seller.rating, seller.reviews)}</div>
                        <div class="profile-bio-box">
                            <div class="bio-item"><i data-lucide="map-pin"></i><span>${seller.location}</span></div>
                            <div class="bio-item"><i data-lucide="briefcase"></i><span>${seller.businessType}</span></div>
                            <div class="bio-item"><i data-lucide="calendar"></i><span>Inscrit en ${seller.joinedDate}</span></div>
                            <div class="bio-item"><i data-lucide="users"></i><span><span id="sellerFollowersCount">0</span> abonnés</span></div>
                            <div class="bio-item"><i data-lucide="user-plus"></i><span><span id="sellerFollowingCount">0</span> abonnements</span></div>
                        </div>
                    </div>
                    <div class="profile-actions-row">
                        <button class="message-contact-btn" type="button" onclick="startChatWithSellerByOwnerId('${profileRow.id}')">
                            <i data-lucide="message-circle" style="width: 18px; height: 18px;"></i>
                            Message
                        </button>
                        <button id="sellerFollowBtn" class="follow-profile-btn" type="button" onclick="toggleSellerFollow('${profileRow.id}'); event.stopPropagation();">
                            <i data-lucide="user-plus"></i>
                            <span id="sellerFollowBtnLabel">Suivre</span>
                        </button>
                        <button class="share-profile-btn" type="button" onclick="shareSellerProfile('${profileRow.id}', '${seller.tag}', '${escapeHtml(seller.name || '')}'); event.stopPropagation();">
                            <i data-lucide="share-2"></i>
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <div class="profile-content">
            <div class="profile-sections-switcher">
                <button class="profile-switch-btn active" id="sellerListingsTab" type="button" onclick="switchSellerProfileSection('listings')">
                    <i data-lucide="layout-grid"></i>
                    <span>Annonces</span>
                </button>
                <button class="profile-switch-btn" id="sellerCoursesTab" type="button" onclick="switchSellerProfileSection('courses')">
                    <i data-lucide="graduation-cap"></i>
                    <span>Cours</span>
                </button>
                <button class="profile-switch-btn" id="sellerReviewsTab" type="button" onclick="switchSellerProfileSection('reviews')">
                    <i data-lucide="star"></i>
                    <span>Avis</span>
                </button>
            </div>
            <div id="sellerListingsSection" class="profile-section-panel active">
                ${listingsBlock}
            </div>
            <div id="sellerCoursesSection" class="profile-section-panel">
                <h3>Cours de ${seller.name}</h3>
                <div id="sellerProfileCoursesList"></div>
            </div>
            <div id="sellerReviewsSection" class="profile-section-panel">
                <div class="reviews-section">
                    <h3>Laisser un avis sur ${seller.name}</h3>
                    <div class="review-form">
                        <select id="sellerProfileReviewRating">
                            <option value="5">5 - Excellent</option>
                            <option value="4">4 - Très bien</option>
                            <option value="3">3 - Correct</option>
                            <option value="2">2 - Moyen</option>
                            <option value="1">1 - Mauvais</option>
                        </select>
                        <textarea id="sellerProfileReviewComment" rows="3" placeholder="Votre commentaire sur ce profil..."></textarea>
                        <button class="submit-btn" type="button" onclick="addProfileReviewById('${profileRow.id}','seller-profile')">Publier l'avis</button>
                    </div>
                    <h3 style="margin-top:18px;">Avis sur ${seller.name}</h3>
                    <div class="reviews-list" id="sellerProfileReviewsList">${getReviewsListHTML([], seller.name, false, 'profile', seller.tag)}</div>
                </div>
            </div>
        </div>`;
    showSection('seller-profile-section');
    applyCoursesFeatureVisibility();
    applyLiveSocialShoppingFeatureVisibility();
    try {
        const sellerGrid = content.querySelector('#sellerListingsSection .listings-grid');
        if (sellerGrid) initCarouselsInContainer(sellerGrid);
    } catch (e) {
        null;
    }
    switchSellerProfileSection(section);
    initSellerProfileFollowUI(profileRow.id);
    fetchProfileRatingSummary(profileRow.id).then((summary) => {
        if (String(currentSellerProfileOwnerId || '') !== String(profileRow.id || '')) return;
        profileRatingSummaryCache.set(String(profileRow.id), summary);
        const el = document.getElementById('sellerProfileRatingContainer');
        if (el) el.innerHTML = getRatingHTML(summary.rating, summary.reviews);
        scheduleLucideCreateIcons(el || document.getElementById('seller-profile-section') || document.body);
    });
    scheduleLucideCreateIcons(content);
    if (shouldFetchListings) {
        fetchSellerProfileListingsFromSupabase(ownerId, profileRow)
            .then((rows) => {
                if (String(currentSellerProfileOwnerId || '') !== ownerId) return;
                const sectionEl = document.getElementById('sellerListingsSection');
                if (!sectionEl) return;
                sectionEl.innerHTML = rows.length > 0
                    ? `<h3>Annonces de ${seller.name}</h3><div class="listings-grid">${rows.map(l => createCardHTML(l)).join('')}</div>`
                    : '<div style="text-align: center; padding: 40px; color: var(--text-muted);"><i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin-bottom: 15px; opacity: 0.5;"></i><p>Cet utilisateur n\'a pas encore d\'annonces publiées.</p></div>';
                try {
                    const grid = sectionEl.querySelector('.listings-grid');
                    if (grid) initCarouselsInContainer(grid);
                } catch (e) {
                    null;
                }
                scheduleLucideCreateIcons(sectionEl);
            })
            .catch(() => null);
    }
}

function openLightbox(imageSrc) {
    document.getElementById('lightboxImage').src = imageSrc;
    document.getElementById('imageLightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('imageLightbox').classList.remove('active');
}

function openChatVideoLightbox(videoSrc) {
    const el = document.getElementById('chatLightboxVideo');
    if (el) {
        el.pause();
        el.removeAttribute('src');
        el.src = videoSrc;
        try {
            el.currentTime = 0;
        } catch (e) {
            null;
        }
    }
    document.getElementById('chatVideoLightbox')?.classList?.add('active');
    scheduleLucideCreateIcons();
}

function closeChatVideoLightbox() {
    const el = document.getElementById('chatLightboxVideo');
    if (el) {
        try {
            el.pause();
        } catch (e) {
            null;
        }
        try {
            el.removeAttribute('src');
            el.load?.();
        } catch (e) {
            null;
        }
    }
    document.getElementById('chatVideoLightbox')?.classList?.remove('active');
}

function switchToRegister() {
    closeModal('loginModal');
    openModal('registerModal');
}

function switchToLogin() {
    closeModal('registerModal');
    openModal('loginModal');
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const statusEl = document.getElementById('chatSendStatus');
    if (!activeChatTag) {
        showToast('Select a chat first', 'alert-circle');
        return;
    }
    const message = input.value.trim();
    if (!message) return;
    const chat = mockChats[activeChatTag];
    if (!chat) return;
    if (!requireAuthOrPrompt()) return;
    if (DEMO_MODE) {
        const createdAt = new Date().toISOString();
        chat.messages.push({ id: newMessageId(), type: 'sent', kind: 'text', text: message, created_at: createdAt, time: formatChatTime(createdAt) });
        input.value = '';
        await switchChat(activeChatTag, false, { skipFetch: true });
        return;
    }
    try {
        if (statusEl) {
            statusEl.className = 'chat-send-status sending';
            statusEl.textContent = 'Sending...';
            statusEl.style.display = 'block';
        }
    } catch (e) {
        null;
    }
    const createdAt = new Date().toISOString();
    const pendingId = newMessageId();
    const pendingMsg = {
        id: pendingId,
        type: 'sent',
        kind: 'text',
        text: message,
        created_at: createdAt,
        time: formatChatTime(createdAt),
        status: 'sending'
    };
    upsertPendingChatMessage(activeChatTag, pendingMsg);
    chat.messages.push(pendingMsg);
    input.value = '';
    await switchChat(activeChatTag, false, { skipFetch: true });
    const ok = await sendPendingTextMessage(activeChatTag, chat, pendingMsg);
    try {
        if (statusEl) {
            statusEl.className = ok ? 'chat-send-status success' : 'chat-send-status error';
            statusEl.textContent = ok ? 'Sent' : 'Failed to send. Tap Retry on the message.';
            statusEl.style.display = 'block';
        }
    } catch (e) {
        null;
    }
    try {
        if (sendBtn) sendBtn.disabled = false;
        if (input) input.disabled = false;
    } catch (e) {
        null;
    }
}

function wipeWinjayStorage() {
    try {
        const toRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('winjay')) toRemove.push(key);
        }
        toRemove.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
        null;
    }
    try {
        const toRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith('winjay')) toRemove.push(key);
        }
        toRemove.forEach((key) => sessionStorage.removeItem(key));
    } catch (e) {
        null;
    }
}

function resetLocalAppStateToFresh() {
    userProfile = createEmptyUserProfile();
    myListings = [];
    myProfileListingsLoaded = false;
    favorites = [];
    searchHistory = [];
    editingListingId = null;
    currentListingDetailId = null;
    currentSellerProfileTag = null;
    try {
        Object.keys(listingReviewPanelState).forEach((k) => delete listingReviewPanelState[k]);
    } catch (e) {
        null;
    }
    updateProfileUI();
    renderListings();
    renderFavorites();
    try {
        renderMessagesList();
    } catch (e) {
        null;
    }
}

function handleLogout() {
    showConfirmModal(
        'Déconnexion',
        'Êtes-vous sûr de vouloir vous déconnecter ?',
        async () => {
            try {
                const client = initSupabase();
                if (client) await client.auth.signOut();
            } catch (e) {
                null;
            }
            clearSupabaseAuthTokenFromAllStorages();
            wipeWinjayStorage();
            resetLocalAppStateToFresh();
            showToast('Logged out', 'log-out');
            showSection('home-section');
        }
    );
}

let activeCourseId = null;
let activeCourseFromSection = 'profile-section';
let activeCourseCreateModuleCourseId = null;
let activeCourseCreateLessonCourseId = null;
let activeCourseCreateLessonModuleId = null;
let activeCourseInviteCourseId = null;
let activeCourseLastLessonId = null;
let activeCourseProgressFlushTimer = null;
let activeCourseProgressInFlight = false;
let activeCourseProgressQueued = null;
let activeCourseEditId = null;
let activeCourseEditModuleId = null;
let activeCourseEditLessonId = null;

function getCourseModulesScrollTop() {
    const main = document.scrollingElement || document.documentElement || null;
    return Number(main?.scrollTop) || 0;
}

function setCourseModulesScrollTop(value) {
    const main = document.scrollingElement || document.documentElement || null;
    if (!main) return;
    try {
        main.scrollTop = Math.max(0, Number(value) || 0);
    } catch (e) {
        null;
    }
}

function swapCourseModuleDom(moduleId, direction) {
    const mid = String(moduleId || '').trim();
    if (!mid) return false;
    const el = document.getElementById(`courseModule-${mid}`);
    if (!el) return false;
    const parent = el.parentElement;
    if (!parent) return false;
    const target = direction === 'up' ? el.previousElementSibling : el.nextElementSibling;
    if (!target || !target.classList.contains('course-module')) return false;
    if (direction === 'up') parent.insertBefore(el, target);
    else parent.insertBefore(target, el);
    return true;
}

function swapCourseLessonDom(lessonId, direction) {
    const lid = String(lessonId || '').trim();
    if (!lid) return false;
    const el = document.getElementById(`courseLesson-${lid}`);
    if (!el) return false;
    const parent = el.parentElement;
    if (!parent) return false;
    const target = direction === 'up' ? el.previousElementSibling : el.nextElementSibling;
    if (!target || !target.classList.contains('course-lesson-item')) return false;
    if (direction === 'up') parent.insertBefore(el, target);
    else parent.insertBefore(target, el);
    return true;
}

function clearCourseLessonPlaybackIfDeleted(lessonId) {
    const lid = String(lessonId || '').trim();
    if (!lid) return;
    if (String(activeCourseLastLessonId || '') !== lid) return;
    activeCourseLastLessonId = null;
    const lessonVideo = document.getElementById('courseLessonVideo');
    const nowPlaying = document.getElementById('courseNowPlaying');
    const lessonPlayer = document.getElementById('courseLessonPlayer');
    try {
        if (lessonVideo) {
            lessonVideo.pause();
            lessonVideo.removeAttribute('src');
            lessonVideo.load();
        }
    } catch (e) {
        null;
    }
    if (nowPlaying) nowPlaying.textContent = '';
    if (lessonPlayer) lessonPlayer.style.display = 'none';
}

function markCourseLessonCompletedInDom(lessonId) {
    const lid = String(lessonId || '').trim();
    if (!lid) return false;
    const el = document.getElementById(`courseLesson-${lid}`);
    if (!el) return false;
    el.classList.add('course-lesson-completed');
    const icon = el.querySelector('.course-lesson-left i[data-lucide]');
    if (icon) icon.setAttribute('data-lucide', 'check-circle');
    const meta = el.querySelector('.course-lesson-meta');
    if (meta) meta.textContent = 'Completed';
    try {
        scheduleLucideCreateIcons(el);
    } catch (e) {
        null;
    }
    return true;
}

function updateCourseProgressFromDom() {
    const fill = document.getElementById('courseProgressFill');
    const value = document.getElementById('courseProgressValue');
    if (!fill || !value) return;
    const items = Array.from(document.querySelectorAll('#courseModulesList .course-lesson-item'));
    const total = items.length;
    const completed = items.filter((el) => el.classList.contains('course-lesson-completed')).length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    fill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
    value.textContent = `${Math.max(0, Math.min(100, pct))}%`;
}

function setCourseRouteParam(courseId, { replace = false, state = null } = {}) {
    try {
        const url = new URL(window.location.href);
        if (courseId) {
            url.searchParams.set('course', String(courseId));
        } else {
            url.searchParams.delete('course');
        }
        const nextState = state !== undefined && state !== null ? state : (history.state && typeof history.state === 'object' ? history.state : null);
        if (replace) {
            history.replaceState(nextState, '', url.pathname + url.search);
        } else {
            history.pushState(nextState, '', url.pathname + url.search);
        }
    } catch (e) {
        null;
    }
}

function setChatRouteParam(enabled, { replace = false, state = null } = {}) {
    try {
        const url = new URL(window.location.href);
        const on = !!enabled;
        if (on) url.searchParams.set('chat', '1');
        else url.searchParams.delete('chat');
        const nextState = state !== undefined && state !== null ? state : (history.state && typeof history.state === 'object' ? history.state : null);
        if (replace) {
            history.replaceState(nextState, '', url.pathname + url.search);
        } else {
            history.pushState(nextState, '', url.pathname + url.search);
        }
    } catch (e) {
        null;
    }
}

function navigateBackFromCourse() {
    const from = String(activeCourseFromSection || '').trim() || 'profile-section';
    activeCourseFromSection = 'profile-section';
    activeCourseId = null;
    setCourseRouteParam('', { replace: true });
    showSection(from === 'course-section' ? 'profile-section' : from);
    if (from === 'profile-section') {
        try {
            localStorage.setItem(MY_PROFILE_LAST_TAB_STORAGE_KEY, 'courses');
        } catch (e) {
            null;
        }
        try {
            switchMyProfileSection('courses');
        } catch (e) {
            null;
        }
    }
}

function openCourse(courseId, { fromSection = null } = {}) {
    const id = String(courseId || '').trim();
    if (!id) return;
    if (!isCoursesFeatureEnabledForViewer()) {
        showToast('Courses are temporarily unavailable', 'alert-circle');
        return;
    }
    activeCourseId = id;
    activeCourseFromSection = fromSection || getActiveSectionId() || 'profile-section';
    const prevState = history.state && typeof history.state === 'object' ? history.state : null;
    setCourseRouteParam(id, {
        replace: false,
        state: {
            __winjay: true,
            view: 'course',
            courseId: id,
            from: activeCourseFromSection,
            fromListingId: prevState?.fromListingId ? Number(prevState.fromListingId) : null
        }
    });
    showSection('course-section');
}

async function requestCourseAccess(ownerTag, courseTitle) {
    if (!requireAuthOrPrompt()) return;
    const tag = String(ownerTag || '').trim();
    if (!tag) {
        showToast('Course owner not found', 'alert-circle');
        return;
    }
    const title = String(courseTitle || 'Course').trim() || 'Course';
    try {
        const cid = String(activeCourseId || '').trim();
        if (cid) {
            const st = history.state && typeof history.state === 'object' ? history.state : null;
            if (st?.view !== 'course' || String(st?.courseId || '') !== cid) {
                setCourseRouteParam(cid, {
                    replace: true,
                    state: { __winjay: true, view: 'course', courseId: cid, from: String(activeCourseFromSection || '').trim() || 'profile-section' }
                });
            }
        }
    } catch (e) {
        null;
    }
    await startChatWithSeller(tag.startsWith('@') ? tag : '@' + tag, { pushState: true });
    setTimeout(() => {
        const input = document.getElementById('chatInput');
        if (!input) return;
        const email = String(currentSupabaseUserEmail || '').trim();
        input.value = `Hi! I’d like access to your course "${title}". My email: ${email}`;
        try {
            input.focus();
        } catch (e) {
            null;
        }
    }, 200);
}

function openCreateCourseModal() {
    if (!requireAuthOrPrompt()) return;
    if (!isCoursesFeatureEnabledForViewer()) {
        showToast('Courses are temporarily unavailable', 'alert-circle');
        return;
    }
    activeCourseEditId = null;
    const title = document.getElementById('createCourseTitle');
    const desc = document.getElementById('createCourseDescription');
    const pub = document.getElementById('createCoursePublished');
    const modalTitle = document.getElementById('createCourseModalTitle');
    const submitBtn = document.getElementById('createCourseSubmitBtn');
    if (title) title.value = '';
    if (desc) desc.value = '';
    resetCreateCourseMediaUI();
    if (pub) pub.checked = false;
    if (modalTitle) modalTitle.textContent = 'Create course';
    if (submitBtn) submitBtn.textContent = 'Create';
    openModal('createCourseModal');
    scheduleLucideCreateIcons(document.getElementById('createCourseModal'));
}

async function openEditCourseModal(courseId) {
    if (!requireAuthOrPrompt()) return;
    const id = String(courseId || '').trim();
    if (!id) return;
    const client = initSupabase();
    if (!client) return;
    const uid = await ensureCurrentSupabaseUserId(client);
    if (!uid) {
        showToast('Session expired, log in again', 'alert-circle');
        openModal('loginModal');
        return;
    }
    const { data: course, error } = await client.from('courses').select('*').eq('id', id).eq('owner_id', uid).maybeSingle();
    if (error || !course?.id) {
        showToast(error?.message || 'Course not found', 'alert-circle');
        return;
    }
    activeCourseEditId = String(course.id);
    const title = document.getElementById('createCourseTitle');
    const desc = document.getElementById('createCourseDescription');
    const pub = document.getElementById('createCoursePublished');
    const modalTitle = document.getElementById('createCourseModalTitle');
    const submitBtn = document.getElementById('createCourseSubmitBtn');
    if (title) title.value = String(course.title || '');
    if (desc) desc.value = String(course.description || '');
    resetCreateCourseMediaUI();
    if (pub) pub.checked = !!course.is_published;
    if (modalTitle) modalTitle.textContent = 'Edit course';
    if (submitBtn) submitBtn.textContent = 'Save';
    openModal('createCourseModal');
    scheduleLucideCreateIcons(document.getElementById('createCourseModal'));
}

function openCreateCourseModuleModal(courseId) {
    if (!requireAuthOrPrompt()) return;
    activeCourseEditModuleId = null;
    activeCourseCreateModuleCourseId = String(courseId || '').trim() || null;
    const input = document.getElementById('createCourseModuleTitle');
    const modalTitle = document.getElementById('createCourseModuleModalTitle');
    const submitBtn = document.getElementById('createCourseModuleSubmitBtn');
    if (input) input.value = '';
    if (modalTitle) modalTitle.textContent = 'Add module';
    if (submitBtn) submitBtn.textContent = 'Add';
    openModal('createCourseModuleModal');
    scheduleLucideCreateIcons(document.getElementById('createCourseModuleModal'));
}

async function openEditCourseModuleModal(courseId, moduleId) {
    if (!requireAuthOrPrompt()) return;
    const cid = String(courseId || '').trim();
    const mid = String(moduleId || '').trim();
    if (!cid || !mid) return;
    const client = initSupabase();
    if (!client) return;
    const { data: mod, error } = await client.from('course_modules').select('*').eq('id', mid).eq('course_id', cid).maybeSingle();
    if (error || !mod?.id) {
        showToast(error?.message || 'Module not found', 'alert-circle');
        return;
    }
    activeCourseCreateModuleCourseId = cid;
    activeCourseEditModuleId = String(mod.id);
    const input = document.getElementById('createCourseModuleTitle');
    const modalTitle = document.getElementById('createCourseModuleModalTitle');
    const submitBtn = document.getElementById('createCourseModuleSubmitBtn');
    if (input) input.value = String(mod.title || '');
    if (modalTitle) modalTitle.textContent = 'Edit module';
    if (submitBtn) submitBtn.textContent = 'Save';
    openModal('createCourseModuleModal');
    scheduleLucideCreateIcons(document.getElementById('createCourseModuleModal'));
}

function openCreateCourseLessonModal(courseId, moduleId) {
    if (!requireAuthOrPrompt()) return;
    activeCourseEditLessonId = null;
    activeCourseCreateLessonCourseId = String(courseId || '').trim() || null;
    activeCourseCreateLessonModuleId = String(moduleId || '').trim() || null;
    const title = document.getElementById('createCourseLessonTitle');
    const preview = document.getElementById('createCourseLessonPreview');
    const modalTitle = document.getElementById('createCourseLessonModalTitle');
    const submitBtn = document.getElementById('createCourseLessonSubmitBtn');
    if (title) title.value = '';
    resetCreateCourseLessonMediaUI();
    if (preview) preview.checked = false;
    if (modalTitle) modalTitle.textContent = 'Add lesson';
    if (submitBtn) submitBtn.textContent = 'Add';
    openModal('createCourseLessonModal');
    scheduleLucideCreateIcons(document.getElementById('createCourseLessonModal'));
}

async function openEditCourseLessonModal(courseId, moduleId, lessonId) {
    if (!requireAuthOrPrompt()) return;
    const cid = String(courseId || '').trim();
    const mid = String(moduleId || '').trim();
    const lid = String(lessonId || '').trim();
    if (!cid || !mid || !lid) return;
    const client = initSupabase();
    if (!client) return;
    const { data: lesson, error } = await client
        .from('course_lessons')
        .select('*')
        .eq('id', lid)
        .eq('course_id', cid)
        .eq('module_id', mid)
        .maybeSingle();
    if (error || !lesson?.id) {
        showToast(error?.message || 'Lesson not found', 'alert-circle');
        return;
    }
    activeCourseCreateLessonCourseId = cid;
    activeCourseCreateLessonModuleId = mid;
    activeCourseEditLessonId = String(lesson.id);
    const title = document.getElementById('createCourseLessonTitle');
    const preview = document.getElementById('createCourseLessonPreview');
    const modalTitle = document.getElementById('createCourseLessonModalTitle');
    const submitBtn = document.getElementById('createCourseLessonSubmitBtn');
    if (title) title.value = String(lesson.title || '');
    resetCreateCourseLessonMediaUI();
    if (preview) preview.checked = !!lesson.is_preview;
    if (modalTitle) modalTitle.textContent = 'Edit lesson';
    if (submitBtn) submitBtn.textContent = 'Save';
    openModal('createCourseLessonModal');
    scheduleLucideCreateIcons(document.getElementById('createCourseLessonModal'));
}

function openInviteCourseStudentModal(courseId) {
    if (!requireAuthOrPrompt()) return;
    activeCourseInviteCourseId = String(courseId || '').trim() || null;
    const input = document.getElementById('inviteCourseStudentEmail');
    if (input) input.value = '';
    openModal('inviteCourseStudentModal');
    scheduleLucideCreateIcons(document.getElementById('inviteCourseStudentModal'));
    renderOwnerCourseInvitesList();
}

async function courseAuthedFetch(path, payload) {
    const client = initSupabase();
    if (!client) return { error: 'Supabase is not configured' };
    const { data: sessionData } = await client.auth.getSession();
    const token = sessionData?.session?.access_token || '';
    if (!token) return { error: 'Session expired. Log in again.' };
    if (!SUPABASE_PROJECT_URL) return { error: 'Supabase URL missing' };
    try {
        const res = await fetch(`${SUPABASE_PROJECT_URL}/functions/v1/${path}`, {
            method: 'POST',
            headers: {
                'content-type': 'application/json',
                apikey: SUPABASE_ANON_KEY,
                authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload || {})
        });
        const raw = await res.text();
        let data = null;
        try {
            data = raw ? JSON.parse(raw) : null;
        } catch (e) {
            data = null;
        }
        if (!res.ok) {
            return { error: data?.error || raw || `Request failed (${res.status})` };
        }
        return data || {};
    } catch (e) {
        return { error: 'Network error' };
    }
}

async function saveCourseFromModal() {
    const client = initSupabase();
    if (!client) return;
    const session = await requireValidSessionOrPrompt(client);
    if (!session) return;
    const titleEl = document.getElementById('createCourseTitle');
    const descEl = document.getElementById('createCourseDescription');
    const thumbEl = document.getElementById('createCourseThumbnailFile');
    const vslEl = document.getElementById('createCourseVslFile');
    const pubEl = document.getElementById('createCoursePublished');

    const title = String(titleEl?.value || '').trim();
    const description = String(descEl?.value || '').trim();
    const is_published = !!pubEl?.checked;

    if (!title) {
        showToast('Title is required', 'alert-circle');
        return;
    }

    const editingId = String(activeCourseEditId || '').trim();
    const isEdit = !!editingId;
    const submitBtn = document.getElementById('createCourseSubmitBtn');
    if (submitBtn && !submitBtn.dataset.defaultText) submitBtn.dataset.defaultText = submitBtn.textContent || '';
    const restoreSubmit = () => {
        if (!submitBtn) return;
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.defaultText || submitBtn.textContent || '';
    };
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = isEdit ? 'Saving...' : 'Creating...';
    }
    let courseRow = null;
    let error = null;

    if (isEdit) {
        const res = await client
            .from('courses')
            .update({ title, description, is_published })
            .eq('id', editingId)
            .eq('owner_id', session.user.id)
            .select('*')
            .single();
        courseRow = res.data;
        error = res.error;
    } else {
        const res = await client
            .from('courses')
            .insert({
                owner_id: session.user.id,
                title,
                description,
                is_published
            })
            .select('*')
            .single();
        courseRow = res.data;
        error = res.error;
    }

    if (error || !courseRow?.id) {
        const details = error ? [error.code, error.details, error.hint].filter(Boolean).join(' | ') : '';
        const message = error?.message || (isEdit ? 'Failed to update course' : 'Failed to create course');
        showToast(details ? `${message} (${details})` : message, 'alert-circle');
        restoreSubmit();
        return;
    }

    const courseId = String(courseRow.id);
    if (!isEdit) activeCourseEditId = courseId;
    const thumbFile = thumbEl?.files?.[0] || null;
    const vslFile = vslEl?.files?.[0] || null;

    const tokenForFile = (f) => `${String(f?.name || '')}|${String(f?.size || '')}|${String(f?.lastModified || '')}`;

    let thumbPath = String(thumbEl?.dataset?.uploadedPath || '').trim();
    let vslPath = String(vslEl?.dataset?.uploadedPath || '').trim();

    if (thumbFile) {
        const token = tokenForFile(thumbFile);
        if (thumbEl && thumbEl.dataset.fileToken !== token) {
            thumbEl.dataset.fileToken = token;
            delete thumbEl.dataset.uploadedPath;
            delete thumbEl.dataset.uploadedToken;
            thumbPath = '';
        }
        if (thumbEl && thumbEl.dataset.uploadedToken === token && String(thumbEl.dataset.uploadedPath || '').trim()) {
            thumbPath = String(thumbEl.dataset.uploadedPath || '').trim();
        }
        if (!thumbPath) {
            const signed = await courseAuthedFetch('course-owner-upload-url', {
                courseId,
                kind: 'thumbnail',
                filename: safeStorageFilename(thumbFile.name || 'thumb.png'),
                contentType: thumbFile.type || 'image/png'
            });
            if (signed?.error) {
                showToast(String(signed.error || 'Failed to get upload url'), 'alert-circle');
                restoreSubmit();
                return;
            }
            if (!signed?.error && signed?.signedUrl && signed?.path) {
                const up = await uploadCourseFileToSignedUrlWithProgress({
                    signedUrl: signed.signedUrl,
                    file: thumbFile,
                    label: 'Uploading image…'
                });
                if (up?.error) {
                    showToast(String(up.error || 'Upload failed'), 'alert-circle');
                    restoreSubmit();
                    return;
                }
                thumbPath = String(signed.path || '').trim();
                if (thumbEl) {
                    thumbEl.dataset.uploadedPath = thumbPath;
                    thumbEl.dataset.uploadedToken = tokenForFile(thumbFile);
                }
            }
        }
    }

    if (vslFile) {
        const token = tokenForFile(vslFile);
        if (vslEl && vslEl.dataset.fileToken !== token) {
            vslEl.dataset.fileToken = token;
            delete vslEl.dataset.uploadedPath;
            delete vslEl.dataset.uploadedToken;
            vslPath = '';
        }
        if (vslEl && vslEl.dataset.uploadedToken === token && String(vslEl.dataset.uploadedPath || '').trim()) {
            vslPath = String(vslEl.dataset.uploadedPath || '').trim();
        }
        if (!vslPath) {
            const signed = await courseAuthedFetch('course-owner-upload-url', {
                courseId,
                kind: 'vsl',
                filename: safeStorageFilename(vslFile.name || 'vsl.mp4'),
                contentType: vslFile.type || 'video/mp4'
            });
            if (signed?.error) {
                showToast(String(signed.error || 'Failed to get upload url'), 'alert-circle');
                restoreSubmit();
                return;
            }
            if (!signed?.error && signed?.signedUrl && signed?.path) {
                const up = await uploadCourseFileToSignedUrlWithProgress({
                    signedUrl: signed.signedUrl,
                    file: vslFile,
                    label: 'Uploading video…'
                });
                if (up?.error) {
                    showToast(String(up.error || 'Upload failed'), 'alert-circle');
                    restoreSubmit();
                    return;
                }
                vslPath = String(signed.path || '').trim();
                if (vslEl) {
                    vslEl.dataset.uploadedPath = vslPath;
                    vslEl.dataset.uploadedToken = tokenForFile(vslFile);
                }
            }
        }
    }

    if (thumbPath || vslPath) {
        const payload = {};
        if (thumbPath) payload.thumbnail_object_path = thumbPath;
        if (vslPath) payload.vsl_object_path = vslPath;
        const { data: updated, error: mediaErr } = await client
            .from('courses')
            .update(payload)
            .eq('id', courseId)
            .eq('owner_id', session.user.id)
            .select('*')
            .single();
        if (mediaErr) {
            showToast(mediaErr.message || 'Failed to save course media', 'alert-circle');
            restoreSubmit();
            return;
        }
        courseRow = updated || courseRow;
    }

    closeModal('createCourseModal');
    resetCreateCourseMediaUI();
    restoreSubmit();
    showToast(isEdit ? 'Course updated' : 'Course created', 'check-circle');
    activeCourseEditId = null;
    await renderMyProfileCoursesPanel();
    openCourse(courseId, { fromSection: 'profile-section' });
}

async function saveCourseModuleFromModal() {
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) return;
    const courseId = String(activeCourseCreateModuleCourseId || '').trim();
    if (!courseId) return;
    const titleEl = document.getElementById('createCourseModuleTitle');
    const title = String(titleEl?.value || '').trim();
    if (!title) {
        showToast('Module title is required', 'alert-circle');
        return;
    }
    const editingId = String(activeCourseEditModuleId || '').trim();
    if (editingId) {
        const { error } = await client.from('course_modules').update({ title }).eq('id', editingId).eq('course_id', courseId);
        if (error) {
            showToast(error.message || 'Failed to update module', 'alert-circle');
            return;
        }
    } else {
        const { data: existing } = await client.from('course_modules').select('position').eq('course_id', courseId).order('position', { ascending: false }).limit(1);
        const nextPos = (existing?.[0]?.position ?? -1) + 1;
        const { error } = await client.from('course_modules').insert({ course_id: courseId, title, position: nextPos });
        if (error) {
            showToast(error.message || 'Failed to add module', 'alert-circle');
            return;
        }
    }
    closeModal('createCourseModuleModal');
    showToast(editingId ? 'Module updated' : 'Module added', 'check-circle');
    activeCourseEditModuleId = null;
    await renderCourseSection();
    await renderMyProfileCoursesPanel();
}

async function saveCourseLessonFromModal() {
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) return;
    const courseId = String(activeCourseCreateLessonCourseId || '').trim();
    const moduleId = String(activeCourseCreateLessonModuleId || '').trim();
    if (!courseId || !moduleId) return;
    const titleEl = document.getElementById('createCourseLessonTitle');
    const fileEl = document.getElementById('createCourseLessonVideoFile');
    const previewEl = document.getElementById('createCourseLessonPreview');
    const title = String(titleEl?.value || '').trim();
    const file = fileEl?.files?.[0] || null;
    const is_preview = !!previewEl?.checked;
    if (!title) {
        showToast('Lesson title is required', 'alert-circle');
        return;
    }
    const editingId = String(activeCourseEditLessonId || '').trim();
    const submitBtn = document.getElementById('createCourseLessonSubmitBtn');
    if (submitBtn && !submitBtn.dataset.defaultText) submitBtn.dataset.defaultText = submitBtn.textContent || '';
    const restoreSubmit = () => {
        if (!submitBtn) return;
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.defaultText || submitBtn.textContent || '';
    };
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = editingId ? 'Saving...' : 'Adding...';
    }
    let lessonId = '';
    if (editingId) {
        const { error } = await client
            .from('course_lessons')
            .update({ title, is_preview })
            .eq('id', editingId)
            .eq('course_id', courseId)
            .eq('module_id', moduleId);
        if (error) {
            showToast(error.message || 'Failed to update lesson', 'alert-circle');
            restoreSubmit();
            return;
        }
        lessonId = editingId;
    } else {
        if (!file) {
            showToast('Video file is required', 'alert-circle');
            restoreSubmit();
            return;
        }
        const { data: existing } = await client.from('course_lessons').select('position').eq('module_id', moduleId).order('position', { ascending: false }).limit(1);
        const nextPos = (existing?.[0]?.position ?? -1) + 1;
        const { data: lessonRow, error } = await client
            .from('course_lessons')
            .insert({
                course_id: courseId,
                module_id: moduleId,
                title,
                position: nextPos,
                duration_seconds: 0,
                is_preview
            })
            .select('*')
            .single();
        if (error || !lessonRow?.id) {
            showToast(error?.message || 'Failed to create lesson', 'alert-circle');
            restoreSubmit();
            return;
        }
        lessonId = String(lessonRow.id);
    }

    if (file) {
        const signed = await courseAuthedFetch('course-owner-upload-url', {
            courseId,
            kind: 'lesson',
            lessonId,
            filename: safeStorageFilename(file.name || 'lesson.mp4'),
            contentType: file.type || 'video/mp4'
        });
        if (signed?.error || !signed?.signedUrl || !signed?.path) {
            showToast(signed?.error || 'Failed to prepare video upload', 'alert-circle');
            restoreSubmit();
            return;
        }
        const up = await uploadCourseLessonFileToSignedUrlWithProgress({
            signedUrl: signed.signedUrl,
            file,
            label: 'Uploading video…'
        });
        if (up?.error) {
            showToast(up.error || 'Upload failed', 'alert-circle');
            restoreSubmit();
            return;
        }
        const { error: mediaErr } = await client
            .from('course_lesson_media')
            .upsert({
                lesson_id: lessonId,
                video_bucket: COURSE_VIDEOS_BUCKET,
                video_object_path: String(signed.path || '').trim()
            });
        if (mediaErr) {
            showToast(mediaErr.message || 'Failed to save lesson video', 'alert-circle');
            restoreSubmit();
            return;
        }
    }

    closeModal('createCourseLessonModal');
    resetCreateCourseLessonMediaUI();
    restoreSubmit();
    showToast(editingId ? 'Lesson updated' : 'Lesson added', 'check-circle');
    activeCourseEditLessonId = null;
    await renderCourseSection();
}

async function inviteCourseStudentFromModal() {
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) return;
    const courseId = String(activeCourseInviteCourseId || '').trim();
    if (!courseId) return;
    const input = document.getElementById('inviteCourseStudentEmail');
    const email = String(input?.value || '').trim().toLowerCase();
    if (!email || !email.includes('@')) {
        showToast('Valid email required', 'alert-circle');
        return;
    }
    const { error } = await client.from('course_invites').insert({
        course_id: courseId,
        email,
        invited_by: currentSupabaseUserId,
        status: 'pending'
    });
    if (error) {
        showToast(error.message || 'Failed to invite', 'alert-circle');
        return;
    }
    if (input) input.value = '';
    showToast('Invite sent', 'check-circle');
    await renderOwnerCourseInvitesList();
    await renderMyProfileCoursesPanel();
}

async function acceptCourseInvite(inviteId) {
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) return;
    const id = String(inviteId || '').trim();
    if (!id) return;
    const { error } = await client.rpc('accept_course_invite', { p_invite_id: id });
    if (error) {
        showToast(error.message || 'Failed to accept invite', 'alert-circle');
        return;
    }
    showToast('Access granted', 'check-circle');
    await renderMyProfileCoursesPanel();
}

async function deleteCourse(courseId) {
    if (!requireAuthOrPrompt()) return;
    const id = String(courseId || '').trim();
    if (!id) return;
    showConfirmModal('Delete course', 'This will remove the course and its modules/lessons from your dashboard.', async () => {
        const client = initSupabase();
        if (!client) return;
        const uid = await ensureCurrentSupabaseUserId(client);
        if (!uid) {
            showToast('Session expired, log in again', 'alert-circle');
            openModal('loginModal');
            return;
        }
        const { error } = await client.from('courses').delete().eq('id', id).eq('owner_id', uid);
        if (error) {
            showToast(error.message || 'Failed to delete course', 'alert-circle');
            return;
        }
        showToast('Course deleted', 'check-circle');
        if (String(activeCourseId || '') === id) navigateBackFromCourse();
        await renderMyProfileCoursesPanel();
    }, true, 'Delete', 'Cancel');
}

async function deleteCourseModule(courseId, moduleId) {
    if (!requireAuthOrPrompt()) return;
    const cid = String(courseId || '').trim();
    const mid = String(moduleId || '').trim();
    if (!cid || !mid) return;
    showConfirmModal('Delete module', 'Lessons in this module will also be removed from the course page.', async () => {
        const client = initSupabase();
        if (!client) return;
        const { error } = await client.from('course_modules').delete().eq('id', mid).eq('course_id', cid);
        if (error) {
            showToast(error.message || 'Failed to delete module', 'alert-circle');
            return;
        }
        showToast('Module deleted', 'check-circle');
        const prevScroll = getCourseModulesScrollTop();
        const moduleEl = document.getElementById(`courseModule-${mid}`);
        if (moduleEl) {
            try {
                const active = String(activeCourseLastLessonId || '').trim();
                if (active && moduleEl.querySelector(`#courseLesson-${active}`)) clearCourseLessonPlaybackIfDeleted(active);
            } catch (e) {
                null;
            }
            moduleEl.remove();
            setCourseModulesScrollTop(prevScroll);
            return;
        }
        await renderCourseSection();
    }, true, 'Delete', 'Cancel');
}

async function deleteCourseLesson(courseId, moduleId, lessonId) {
    if (!requireAuthOrPrompt()) return;
    const cid = String(courseId || '').trim();
    const mid = String(moduleId || '').trim();
    const lid = String(lessonId || '').trim();
    if (!cid || !mid || !lid) return;
    showConfirmModal('Delete lesson', 'This lesson will be removed from the course.', async () => {
        const client = initSupabase();
        if (!client) return;
        const { error } = await client.from('course_lessons').delete().eq('id', lid).eq('course_id', cid).eq('module_id', mid);
        if (error) {
            showToast(error.message || 'Failed to delete lesson', 'alert-circle');
            return;
        }
        showToast('Lesson deleted', 'check-circle');
        const prevScroll = getCourseModulesScrollTop();
        clearCourseLessonPlaybackIfDeleted(lid);
        const el = document.getElementById(`courseLesson-${lid}`);
        if (el) {
            el.remove();
            setCourseModulesScrollTop(prevScroll);
            return;
        }
        await renderCourseSection();
    }, true, 'Delete', 'Cancel');
}

async function moveCourseModule(courseId, moduleId, direction) {
    if (!requireAuthOrPrompt()) return;
    const cid = String(courseId || '').trim();
    const mid = String(moduleId || '').trim();
    const dir = direction === 'up' ? 'up' : 'down';
    if (!cid || !mid) return;
    const client = initSupabase();
    if (!client) return;
    const { data: mod } = await client.from('course_modules').select('id, position').eq('id', mid).eq('course_id', cid).maybeSingle();
    if (!mod?.id) return;
    const pos = Number(mod.position ?? 0);
    const neighborQuery = client
        .from('course_modules')
        .select('id, position')
        .eq('course_id', cid)
        .neq('id', mid)
        .order('position', { ascending: dir === 'up' ? false : true })
        .limit(1);
    const { data: neighbor } =
        dir === 'up' ? await neighborQuery.lt('position', pos) : await neighborQuery.gt('position', pos);
    const n = Array.isArray(neighbor) ? neighbor[0] : null;
    if (!n?.id) return;
    await client.from('course_modules').update({ position: n.position }).eq('id', mid).eq('course_id', cid);
    await client.from('course_modules').update({ position: pos }).eq('id', n.id).eq('course_id', cid);
    const prevScroll = getCourseModulesScrollTop();
    const swapped = swapCourseModuleDom(mid, dir);
    if (swapped) {
        setCourseModulesScrollTop(prevScroll);
        return;
    }
    await renderCourseSection();
}

async function moveCourseLesson(courseId, moduleId, lessonId, direction) {
    if (!requireAuthOrPrompt()) return;
    const cid = String(courseId || '').trim();
    const mid = String(moduleId || '').trim();
    const lid = String(lessonId || '').trim();
    const dir = direction === 'up' ? 'up' : 'down';
    if (!cid || !mid || !lid) return;
    const client = initSupabase();
    if (!client) return;
    const { data: lesson } = await client.from('course_lessons').select('id, position').eq('id', lid).eq('course_id', cid).eq('module_id', mid).maybeSingle();
    if (!lesson?.id) return;
    const pos = Number(lesson.position ?? 0);
    const neighborQuery = client
        .from('course_lessons')
        .select('id, position')
        .eq('course_id', cid)
        .eq('module_id', mid)
        .neq('id', lid)
        .order('position', { ascending: dir === 'up' ? false : true })
        .limit(1);
    const { data: neighbor } =
        dir === 'up' ? await neighborQuery.lt('position', pos) : await neighborQuery.gt('position', pos);
    const n = Array.isArray(neighbor) ? neighbor[0] : null;
    if (!n?.id) return;
    await client.from('course_lessons').update({ position: n.position }).eq('id', lid).eq('course_id', cid).eq('module_id', mid);
    await client.from('course_lessons').update({ position: pos }).eq('id', n.id).eq('course_id', cid).eq('module_id', mid);
    const prevScroll = getCourseModulesScrollTop();
    const swapped = swapCourseLessonDom(lid, dir);
    if (swapped) {
        setCourseModulesScrollTop(prevScroll);
        return;
    }
    await renderCourseSection();
}

async function renderMyProfileCoursesPanel() {
    const invitesEl = document.getElementById('myCourseInvitesList');
    const enrolledEl = document.getElementById('myEnrolledCoursesList');
    const ownedEl = document.getElementById('myOwnedCoursesList');
    if (!invitesEl || !enrolledEl || !ownedEl) return;
    invitesEl.innerHTML = '<div class="muted">Loading...</div>';
    enrolledEl.innerHTML = '<div class="muted">Loading...</div>';
    ownedEl.innerHTML = '<div class="muted">Loading...</div>';

    const client = initSupabase();
    if (!client) return;
    const uid = await ensureCurrentSupabaseUserId(client);
    if (!uid) {
        invitesEl.innerHTML = '<div class="muted">Please log in to continue.</div>';
        enrolledEl.innerHTML = '<div class="muted">Please log in to continue.</div>';
        ownedEl.innerHTML = '<div class="muted">Please log in to continue.</div>';
        return;
    }

    const [invitesRes, enrollRes, ownedRes] = await Promise.all([
        client
            .from('course_invites')
            .select('id, course_id, status, created_at, courses(id, title, thumbnail_object_path, owner_id)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(50),
        client
            .from('course_enrollments')
            .select('course_id, created_at, courses(id, title, thumbnail_object_path, owner_id)')
            .eq('user_id', uid)
            .order('created_at', { ascending: false })
            .limit(50),
        client
            .from('courses')
            .select('id, title, thumbnail_object_path, is_published, created_at')
            .eq('owner_id', uid)
            .order('created_at', { ascending: false })
            .limit(50)
    ]);

    const invites = Array.isArray(invitesRes?.data) ? invitesRes.data : [];
    const enrollments = Array.isArray(enrollRes?.data) ? enrollRes.data : [];
    const owned = Array.isArray(ownedRes?.data) ? ownedRes.data : [];

    invitesEl.innerHTML = invites.length
        ? invites
              .map((x) => {
                  const c = x?.courses || {};
                  const title = escapeHtml(String(c?.title || 'Course'));
                  return `
                    <div class="admin-list-item" style="margin-bottom:10px;">
                        <div>
                            <div style="font-weight:900;">Invite · ${title}</div>
                            <div class="meta">Check your email · ${escapeHtml(String(currentSupabaseUserEmail || ''))}</div>
                        </div>
                        <button class="admin-action-btn" type="button" onclick="acceptCourseInvite('${String(x.id)}')">Accept</button>
                    </div>
                `;
              })
              .join('')
        : '<div class="muted">No invites.</div>';

    enrolledEl.innerHTML = enrollments.length
        ? enrollments
              .map((x) => {
                  const c = x?.courses || {};
                  const title = escapeHtml(String(c?.title || 'Course'));
                  return `
                    <div class="admin-list-item" style="margin-bottom:10px;">
                        <div>
                            <div style="font-weight:900;">${title}</div>
                            <div class="meta">Enrolled</div>
                        </div>
                        <button class="admin-action-btn" type="button" onclick="openCourse('${String(c?.id || x.course_id)}', { fromSection: 'profile-section' })">Open</button>
                    </div>
                `;
              })
              .join('')
        : '<div class="muted">No enrolled courses yet.</div>';

    ownedEl.innerHTML = owned.length
        ? owned
              .map((c) => {
                  const title = escapeHtml(String(c?.title || 'Course'));
                  const pub = c?.is_published ? 'Published' : 'Private';
                  return `
                    <div class="admin-list-item" style="margin-bottom:10px;">
                        <div>
                            <div style="font-weight:900;">${title}</div>
                            <div class="meta">${pub}</div>
                        </div>
                        <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end;">
                            <button class="admin-action-btn" type="button" onclick="openCourse('${String(c?.id)}', { fromSection: 'profile-section' })">Open</button>
                            <button class="admin-action-btn" type="button" onclick="openEditCourseModal('${String(c?.id)}')">Edit</button>
                            <button class="admin-action-btn" type="button" onclick="openInviteCourseStudentModal('${String(c?.id)}')">Invite</button>
                            <button class="admin-action-btn danger" type="button" onclick="deleteCourse('${String(c?.id)}')">Delete</button>
                        </div>
                    </div>
                `;
              })
              .join('')
        : '<div class="muted">No courses created yet.</div>';

    scheduleLucideCreateIcons(document.getElementById('myProfileCoursesSection') || document.getElementById('profile-section') || document.body);
}

async function renderOwnerCourseInvitesList() {
    const wrap = document.getElementById('courseInvitesOwnerList');
    if (!wrap) return;
    const client = initSupabase();
    if (!client) return;
    const courseId = String(activeCourseInviteCourseId || '').trim();
    if (!courseId) {
        wrap.innerHTML = '<div class="muted">Select a course.</div>';
        return;
    }
    wrap.innerHTML = '<div class="muted">Loading...</div>';
    const { data } = await client
        .from('course_invites')
        .select('id, email, status, created_at')
        .eq('course_id', courseId)
        .order('created_at', { ascending: false })
        .limit(50);
    const rows = Array.isArray(data) ? data : [];
    wrap.innerHTML = rows.length
        ? rows
              .map((x) => {
                  const email = escapeHtml(String(x.email || ''));
                  const status = escapeHtml(String(x.status || ''));
                  return `<div class="admin-list-item" style="margin-bottom:10px;"><div><div style="font-weight:900;">${email}</div><div class="meta">${status}</div></div></div>`;
              })
              .join('')
        : '<div class="muted">No invites.</div>';
}

async function renderCourseSection() {
    const courseId = String(activeCourseId || '').trim();
    if (!courseId) {
        showToast('Select a course first', 'alert-circle');
        showSection('profile-section');
        try {
            switchMyProfileSection('courses');
        } catch (e) {
            null;
        }
        return;
    }
    const titleEl = document.getElementById('courseTitle');
    const ownerEl = document.getElementById('courseOwner');
    const descEl = document.getElementById('courseDescription');
    const aboutEl = document.getElementById('courseAbout');
    const thumbImg = document.getElementById('courseThumbImg');
    const accessRow = document.getElementById('courseAccessRow');
    const vslWrap = document.getElementById('courseVslWrap');
    const vslVideo = document.getElementById('courseVslVideo');
    const lessonPlayer = document.getElementById('courseLessonPlayer');
    const primaryBtn = document.getElementById('coursePrimaryBtn');
    const priceEl = document.getElementById('coursePrice');
    const metaEl = document.getElementById('courseMeta');
    const instructorEl = document.getElementById('courseInstructorCard');
    const playerGrid = document.getElementById('coursePlayerGrid');
    const modulesList = document.getElementById('courseModulesList');
    const achievementsList = document.getElementById('courseAchievementsList');
    const progressFill = document.getElementById('courseProgressFill');
    const progressValue = document.getElementById('courseProgressValue');
    const nowPlaying = document.getElementById('courseNowPlaying');
    const lessonVideo = document.getElementById('courseLessonVideo');
    if (!titleEl || !ownerEl || !descEl || !aboutEl || !thumbImg || !accessRow || !vslWrap || !vslVideo || !lessonPlayer || !primaryBtn || !priceEl || !metaEl || !instructorEl || !playerGrid || !modulesList || !achievementsList || !progressFill || !progressValue || !nowPlaying || !lessonVideo) return;

    titleEl.textContent = 'Course';
    ownerEl.textContent = '—';
    descEl.textContent = '';
    aboutEl.textContent = '';
    thumbImg.src = '';
    accessRow.innerHTML = '';
    vslWrap.style.display = 'none';
    try {
        vslVideo.removeAttribute('src');
        vslVideo.load();
    } catch (e) {
        null;
    }
    lessonPlayer.style.display = 'none';
    playerGrid.style.display = 'none';
    modulesList.innerHTML = '<div class="muted">Loading...</div>';
    achievementsList.innerHTML = '<div class="muted">Loading...</div>';
    progressFill.style.width = '0%';
    progressValue.textContent = '0%';
    nowPlaying.textContent = '';
    try {
        lessonVideo.removeAttribute('src');
        lessonVideo.load();
    } catch (e) {
        null;
    }
    priceEl.textContent = '';
    primaryBtn.textContent = '';
    primaryBtn.disabled = true;
    primaryBtn.onclick = null;
    metaEl.innerHTML = '';
    instructorEl.innerHTML = '<div class="muted">—</div>';

    const client = initSupabase();
    if (!client) return;

    const { data: course, error: courseErr } = await client
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .maybeSingle();

    if (courseErr || !course?.id) {
        showToast(courseErr?.message || 'Course not found', 'alert-circle');
        navigateBackFromCourse();
        return;
    }

    const isOwner = String(course.owner_id || '') === String(currentSupabaseUserId || '');

    let isEnrolled = false;
    if (currentSupabaseUserId) {
        const { data: enrollment } = await client
            .from('course_enrollments')
            .select('course_id, user_id')
            .eq('course_id', courseId)
            .eq('user_id', currentSupabaseUserId)
            .maybeSingle();
        isEnrolled = !!enrollment?.course_id;
    }

    titleEl.textContent = String(course.title || 'Course');
    descEl.textContent = String(course.description || '');
    aboutEl.textContent = String(course.description || '');

    const ownerProfiles = await fetchProfilesByIds([course.owner_id]);
    const ownerRow = ownerProfiles?.[String(course.owner_id || '')] || { id: course.owner_id };
    const seller = mapProfileRowToSeller(ownerRow);
    const ownerName = seller.name || ownerRow?.display_name || ownerRow?.tag || 'Owner';
    ownerEl.textContent = `By ${String(ownerName || 'Owner')}`;
    const aboutBits = [];
    if (seller.businessType) aboutBits.push(String(seller.businessType));
    if (seller.location) aboutBits.push(String(seller.location));
    if (seller.joinedDate) aboutBits.push(`Joined ${String(seller.joinedDate)}`);
    instructorEl.innerHTML = `
        <div class="course-instructor-head">
            <div class="course-instructor-avatar"><img src="${escapeHtml(String(seller.pic || seller.profilePic || ''))}" alt=""></div>
            <div style="min-width:0;">
                <div class="course-instructor-name">${escapeHtml(String(ownerName || 'Owner'))}</div>
                <div class="course-instructor-meta">${escapeHtml(String(seller.tag || ''))}</div>
            </div>
        </div>
        <div class="course-instructor-bio">${escapeHtml(aboutBits.join(' • ') || 'Course creator')}</div>
    `;

    if (String(course.thumbnail_object_path || '').trim()) {
        const publicUrl = client.storage.from(COURSE_PUBLIC_BUCKET).getPublicUrl(String(course.thumbnail_object_path)).data?.publicUrl || '';
        if (publicUrl) thumbImg.src = publicUrl;
    }

    if (String(course.vsl_object_path || '').trim()) {
        const vslUrl = client.storage.from(COURSE_PUBLIC_BUCKET).getPublicUrl(String(course.vsl_object_path)).data?.publicUrl || '';
        if (vslUrl) {
            try {
                vslVideo.src = vslUrl;
                vslWrap.style.display = '';
            } catch (e) {
                null;
            }
        }
    }

    const ownerTag = String(seller.tag || ownerRow?.tag || '').trim();
    const accessBits = [];
    if (isOwner) {
        accessBits.push(`<span class="admin-badge ok">OWNER</span>`);
        accessBits.push(`<button class="admin-action-btn" type="button" onclick="openInviteCourseStudentModal('${courseId}')">Invite student</button>`);
        accessBits.push(`<button class="admin-action-btn" type="button" onclick="openCreateCourseModuleModal('${courseId}')">Add module</button>`);
        accessBits.push(`<button class="admin-action-btn" type="button" onclick="toggleCoursePublish('${courseId}', ${course.is_published ? 'false' : 'true'})">${course.is_published ? 'Unpublish' : 'Publish'}</button>`);
    } else if (isEnrolled) {
        accessBits.push(`<span class="admin-badge ok">STUDENT ACCESS</span>`);
    } else {
        accessBits.push(`<span class="admin-badge pending">NO ACCESS</span>`);
        accessBits.push(
            `<button class="admin-action-btn" type="button" onclick="requestCourseAccess('${escapeHtml(ownerTag)}', '${escapeHtml(String(course.title || 'Course'))}')">How to get access</button>`
        );
    }
    accessRow.innerHTML = accessBits.join(' ');

    const canAccessLessons = isOwner || isEnrolled;
    priceEl.textContent = canAccessLessons ? 'Accès' : 'Invite only';
    primaryBtn.disabled = false;
    if (isOwner) {
        primaryBtn.textContent = course.is_published ? 'View published page' : 'Preview course page';
        primaryBtn.onclick = () => {
            try {
                document.getElementById('courseModulesList')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
            } catch (e) {
                null;
            }
        };
    } else if (isEnrolled) {
        primaryBtn.textContent = 'Continue learning';
        primaryBtn.onclick = () => {
            try {
                document.getElementById('courseModulesList')?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
            } catch (e) {
                null;
            }
        };
    } else {
        primaryBtn.textContent = 'Request access';
        primaryBtn.onclick = () => requestCourseAccess(ownerTag, String(course.title || 'Course'));
    }

    const createdAt = course.created_at ? new Date(String(course.created_at)) : null;
    const updatedAt = course.updated_at ? new Date(String(course.updated_at)) : null;
    const lastDate = updatedAt && !Number.isNaN(updatedAt.getTime()) ? updatedAt : createdAt;
    const lastStr = lastDate && !Number.isNaN(lastDate.getTime()) ? lastDate.toLocaleDateString() : '';
    const levelStr = String(course.level || '').trim();
    const langStr = String(course.language || '').trim();
    const pubStr = course.is_published ? 'Published' : 'Draft';

    metaEl.innerHTML = `
        ${levelStr ? `<div class="course-meta-item"><i data-lucide="bar-chart-3"></i><span>${escapeHtml(levelStr)}</span></div>` : ''}
        ${langStr ? `<div class="course-meta-item"><i data-lucide="languages"></i><span>${escapeHtml(langStr)}</span></div>` : ''}
        ${lastStr ? `<div class="course-meta-item"><i data-lucide="calendar"></i><span>Updated ${escapeHtml(lastStr)}</span></div>` : ''}
        <div class="course-meta-item"><i data-lucide="shield"></i><span>${escapeHtml(pubStr)}</span></div>
        <div class="course-meta-item"><i data-lucide="lock"></i><span>${canAccessLessons ? 'Access granted' : 'Invite-only access'}</span></div>
    `;

    if (!canAccessLessons) {
        achievementsList.innerHTML = '<div class="muted">—</div>';
        progressFill.style.width = '0%';
        progressValue.textContent = '0%';
        playerGrid.style.display = 'none';
    }

    const queries = [
        client.from('course_modules').select('*').eq('course_id', courseId).order('position', { ascending: true }).limit(500),
        client.from('course_lessons').select('*').eq('course_id', courseId).order('position', { ascending: true }).limit(1000)
    ];
    if (canAccessLessons) {
        queries.push(
            client
                .from('course_lesson_progress')
                .select('lesson_id, completed, last_position_seconds')
                .eq('user_id', currentSupabaseUserId)
                .limit(2000)
        );
        queries.push(
            client
                .from('course_user_achievements')
                .select('code, earned_at, course_achievements(code, title, description, icon)')
                .eq('course_id', courseId)
                .eq('user_id', currentSupabaseUserId)
                .order('earned_at', { ascending: false })
                .limit(50)
        );
    } else {
        queries.push(Promise.resolve({ data: [] }));
        queries.push(Promise.resolve({ data: [] }));
    }
    const [modsRes, lessonsRes, progRes, achRes] = await Promise.all(queries);

    const modules = Array.isArray(modsRes?.data) ? modsRes.data : [];
    const lessons = Array.isArray(lessonsRes?.data) ? lessonsRes.data : [];
    const progressRows = Array.isArray(progRes?.data) ? progRes.data : [];
    const achievements = Array.isArray(achRes?.data) ? achRes.data : [];

    const progressByLesson = {};
    progressRows.forEach((p) => {
        if (!p?.lesson_id) return;
        progressByLesson[String(p.lesson_id)] = p;
    });

    if (canAccessLessons) {
        const totalLessons = lessons.length;
        const completedLessons = lessons.filter((l) => !!progressByLesson[String(l.id)]?.completed).length;
        const pct = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        progressFill.style.width = `${Math.max(0, Math.min(100, pct))}%`;
        progressValue.textContent = `${Math.max(0, Math.min(100, pct))}%`;
    }

    const lessonsByModule = {};
    lessons.forEach((l) => {
        const mid = String(l.module_id || '');
        if (!lessonsByModule[mid]) lessonsByModule[mid] = [];
        lessonsByModule[mid].push(l);
    });
    Object.keys(lessonsByModule).forEach((mid) => {
        lessonsByModule[mid].sort((a, b) => Number(a.position) - Number(b.position));
    });

    const totalDurationSeconds = lessons.reduce((sum, l) => sum + (Number(l.duration_seconds) || 0), 0);
    const totalLessons = lessons.length;
    const totalModules = modules.length;
    const durationStr = totalDurationSeconds > 0 ? formatTime(totalDurationSeconds) : '';
    const metaBits = [];
    if (totalModules) metaBits.push(`<div class="course-meta-item"><i data-lucide="layers"></i><span>${totalModules} modules</span></div>`);
    if (totalLessons) metaBits.push(`<div class="course-meta-item"><i data-lucide="list-video"></i><span>${totalLessons} lessons</span></div>`);
    if (durationStr) metaBits.push(`<div class="course-meta-item"><i data-lucide="clock"></i><span>${escapeHtml(durationStr)} total</span></div>`);
    if (metaBits.length) metaEl.innerHTML = metaBits.join('') + metaEl.innerHTML;

    modulesList.innerHTML = modules.length
        ? modules
              .map((m, idx) => {
                  const mid = String(m.id);
                  const moduleLessons = lessonsByModule[mid] || [];
                  const expanded = idx === 0;
                  const listHtml = moduleLessons.length
                      ? `<div class="course-lessons-list">${moduleLessons
                            .map((l) => {
                                const lid = String(l.id);
                                const p = progressByLesson[lid] || {};
                                const done = !!p.completed;
                                const icon = done ? 'check-circle' : 'play-circle';
                                const label = done ? 'Completed' : canAccessLessons ? (!!l.is_preview ? 'Preview' : 'Lesson') : 'Locked';
                                const duration = Number(l.duration_seconds) || 0;
                                const durText = duration > 0 ? formatTime(duration) : '';
                                const accessible = canAccessLessons;
                                const lockIcon = accessible ? '' : `<span class="course-lesson-lock"><i data-lucide="lock"></i></span>`;
                                const ownerActions = isOwner
                                    ? `<div class="course-lesson-owner-actions">
                                            <button class="icon-btn" type="button" onclick="event.stopPropagation(); moveCourseLesson('${courseId}','${mid}','${lid}','up')" title="Move up"><i data-lucide="chevron-up"></i></button>
                                            <button class="icon-btn" type="button" onclick="event.stopPropagation(); moveCourseLesson('${courseId}','${mid}','${lid}','down')" title="Move down"><i data-lucide="chevron-down"></i></button>
                                            <button class="icon-btn" type="button" onclick="event.stopPropagation(); openEditCourseLessonModal('${courseId}','${mid}','${lid}')" title="Edit"><i data-lucide="pencil"></i></button>
                                            <button class="icon-btn danger" type="button" onclick="event.stopPropagation(); deleteCourseLesson('${courseId}','${mid}','${lid}')" title="Delete"><i data-lucide="trash-2"></i></button>
                                        </div>`
                                    : '';
                                const right = `<div class="course-lesson-right">${durText ? `<span class="course-lesson-duration">${durText}</span>` : ''}${lockIcon}${ownerActions}</div>`;
                                return `
                                    <div class="course-lesson-item ${accessible ? 'course-lesson-accessible' : ''} ${done ? 'course-lesson-completed' : ''}" id="courseLesson-${escapeHtml(lid)}" data-lesson-id="${escapeHtml(lid)}" data-module-id="${escapeHtml(mid)}" onclick="${accessible ? `playCourseLesson('${lid}')` : `requestCourseAccess('${escapeHtml(ownerTag)}', '${escapeHtml(String(course.title || 'Course'))}')`}">
                                        <div class="course-lesson-left">
                                            <i data-lucide="${icon}"></i>
                                            <div style="min-width:0;">
                                                <div class="course-lesson-title">${escapeHtml(String(l.title || 'Lesson'))}</div>
                                                <div class="course-lesson-meta">${label}</div>
                                            </div>
                                        </div>
                                        ${right}
                                    </div>
                                `;
                            })
                            .join('')}</div>`
                      : '<div class="muted" style="padding: 10px 12px;">No lessons yet.</div>';
                  const ownerBtn = isOwner
                      ? `<div class="course-module-owner-actions">
                            <button class="icon-btn" type="button" onclick="event.stopPropagation(); moveCourseModule('${courseId}','${mid}','up')" title="Move up"><i data-lucide="chevron-up"></i></button>
                            <button class="icon-btn" type="button" onclick="event.stopPropagation(); moveCourseModule('${courseId}','${mid}','down')" title="Move down"><i data-lucide="chevron-down"></i></button>
                            <button class="icon-btn" type="button" onclick="event.stopPropagation(); openEditCourseModuleModal('${courseId}','${mid}')" title="Edit"><i data-lucide="pencil"></i></button>
                            <button class="icon-btn danger" type="button" onclick="event.stopPropagation(); deleteCourseModule('${courseId}','${mid}')" title="Delete"><i data-lucide="trash-2"></i></button>
                            <button class="admin-action-btn" type="button" onclick="event.stopPropagation(); openCreateCourseLessonModal('${courseId}','${mid}')">Add lesson</button>
                        </div>`
                      : '';
                  return `
                    <div class="course-module ${expanded ? '' : 'collapsed'}" id="courseModule-${escapeHtml(mid)}" data-module-id="${escapeHtml(mid)}">
                        <div class="course-module-head" onclick="toggleCourseModule('${mid}')">
                            <div class="course-module-title">${escapeHtml(String(m.title || 'Module'))}</div>
                            <div class="course-module-right">
                                ${ownerBtn}
                                <span class="course-module-chevron" id="courseModuleChevron-${escapeHtml(mid)}"><i data-lucide="chevron-down"></i></span>
                            </div>
                        </div>
                        <div class="course-module-body" id="courseModuleBody-${escapeHtml(mid)}" style="${expanded ? '' : 'display:none;'}">
                            ${listHtml}
                        </div>
                    </div>
                  `;
              })
              .join('')
        : `<div class="muted">${isOwner ? 'Create your first module to start building.' : 'No modules yet.'}</div>`;

    achievementsList.innerHTML = achievements.length
        ? achievements
              .map((a) => {
                  const meta = a?.course_achievements || {};
                  const icon = escapeHtml(String(meta.icon || 'trophy'));
                  const title = escapeHtml(String(meta.title || a.code || 'Achievement'));
                  const desc = escapeHtml(String(meta.description || ''));
                  return `
                    <div class="course-achievement">
                        <i data-lucide="${icon}"></i>
                        <div>
                            <div class="course-achievement-title">${title}</div>
                            <div class="course-achievement-desc">${desc}</div>
                        </div>
                    </div>
                  `;
              })
              .join('')
        : '<div class="muted">No achievements yet.</div>';

    scheduleLucideCreateIcons(achievementsList);
}

function toggleCourseModule(moduleId) {
    const id = String(moduleId || '').trim();
    if (!id) return;
    const body = document.getElementById(`courseModuleBody-${id}`);
    if (!body) return;
    const next = body.style.display === 'none';
    body.style.display = next ? '' : 'none';
    const moduleEl = body.closest('.course-module');
    if (moduleEl) moduleEl.classList.toggle('collapsed', !next);
    scheduleLucideCreateIcons(moduleEl || body);
}

async function toggleCoursePublish(courseId, next) {
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) return;
    const id = String(courseId || '').trim();
    const value = !!next;
    if (!id) return;
    const { error } = await client.from('courses').update({ is_published: value }).eq('id', id).eq('owner_id', currentSupabaseUserId);
    if (error) {
        showToast(error.message || 'Failed to update', 'alert-circle');
        return;
    }
    showToast(value ? 'Published' : 'Unpublished', 'check-circle');
    await renderMyProfileCoursesPanel();
    await renderCourseSection();
}

async function playCourseLesson(lessonId) {
    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client) return;
    const courseId = String(activeCourseId || '').trim();
    if (!courseId) return;
    const lid = String(lessonId || '').trim();
    if (!lid) return;
    const lessonVideo = document.getElementById('courseLessonVideo');
    const nowPlaying = document.getElementById('courseNowPlaying');
    const lessonPlayer = document.getElementById('courseLessonPlayer');
    if (!lessonVideo || !nowPlaying || !lessonPlayer) return;
    activeCourseLastLessonId = lid;
    nowPlaying.textContent = 'Loading lesson...';
    try {
        lessonVideo.pause();
    } catch (e) {
        null;
    }
    const signed = await courseAuthedFetch('course-lesson-video-url', { lessonId: lid, expiresIn: 60 * 60 });
    if (signed?.error || !signed?.signedUrl) {
        showToast(signed?.error || 'Failed to load video', 'alert-circle');
        nowPlaying.textContent = '';
        return;
    }
    lessonPlayer.style.display = '';
    lessonVideo.src = String(signed.signedUrl);
    lessonVideo.load();
    const { data: lessonRow } = await client.from('course_lessons').select('id, title, duration_seconds').eq('id', lid).maybeSingle();
    nowPlaying.textContent = String(lessonRow?.title || 'Lesson');

    const { data: progressRow } = await client
        .from('course_lesson_progress')
        .select('last_position_seconds, completed')
        .eq('lesson_id', lid)
        .eq('user_id', currentSupabaseUserId)
        .maybeSingle();

    const seekTo = Number(progressRow?.last_position_seconds) || 0;

    const onLoaded = () => {
        try {
            if (seekTo > 3 && Number.isFinite(seekTo)) {
                lessonVideo.currentTime = Math.min(Math.max(0, seekTo), Math.max(0, lessonVideo.duration || seekTo));
            }
        } catch (e) {
            null;
        }
        try {
            if (lessonRow && (!lessonRow.duration_seconds || Number(lessonRow.duration_seconds) <= 0) && lessonVideo.duration && Number.isFinite(Number(lessonVideo.duration))) {
                client.from('course_lessons').update({ duration_seconds: Math.round(Number(lessonVideo.duration)) }).eq('id', lid).eq('course_id', courseId);
            }
        } catch (e) {
            null;
        }
        try {
            lessonVideo.play();
        } catch (e) {
            null;
        }
    };

    lessonVideo.onloadedmetadata = onLoaded;
    lessonVideo.ontimeupdate = () => queueCourseProgressFlush(false);
    lessonVideo.onpause = () => queueCourseProgressFlush(false);
    lessonVideo.onended = () => queueCourseProgressFlush(true);
    try {
        lessonPlayer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
        null;
    }
}

function queueCourseProgressFlush(markComplete) {
    const video = document.getElementById('courseLessonVideo');
    const lessonId = String(activeCourseLastLessonId || '').trim();
    if (!video || !lessonId) return;
    const pos = Math.floor(Number(video.currentTime) || 0);
    const dur = Math.floor(Number(video.duration) || 0);
    activeCourseProgressQueued = { lessonId, pos, dur, markComplete: !!markComplete };
    if (activeCourseProgressInFlight) return;
    if (activeCourseProgressFlushTimer) return;
    activeCourseProgressFlushTimer = setTimeout(() => {
        activeCourseProgressFlushTimer = null;
        flushCourseProgressQueued();
    }, 1200);
}

async function flushCourseProgressQueued() {
    if (activeCourseProgressInFlight) return;
    if (!activeCourseProgressQueued) return;
    const payload = activeCourseProgressQueued;
    activeCourseProgressQueued = null;
    activeCourseProgressInFlight = true;
    try {
        const client = initSupabase();
        if (!client) return;
        await client.rpc('upsert_course_lesson_progress', {
            p_lesson_id: payload.lessonId,
            p_position_seconds: payload.pos,
            p_duration_seconds: payload.dur,
            p_mark_complete: payload.markComplete
        });
    } catch (e) {
        null;
    } finally {
        activeCourseProgressInFlight = false;
        if (activeCourseProgressQueued) {
            setTimeout(() => flushCourseProgressQueued(), 400);
        } else {
            try {
                if (payload?.markComplete) {
                    markCourseLessonCompletedInDom(payload.lessonId);
                    updateCourseProgressFromDom();
                }
            } catch (e) {
                null;
            }
        }
    }
}
