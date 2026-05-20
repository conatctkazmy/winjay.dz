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

function createEmptyUserProfile() {
    return {
        name: "Guest",
        tag: "@guest",
        profilePic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Winjay",
        coverPic: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200",
        location: "",
        businessType: "Particulier",
        phone: "",
        workCategory: "",
        joinedDate: "",
        rating: 0,
        reviews: 0,
        isVip: false,
        verified: false,
        isAdmin: false,
        reviewsData: []
    };
}

let userProfile = createEmptyUserProfile();

const USER_PROFILE_STORAGE_KEY = 'winjayUserProfileV1';
const FREE_VERIFIED_PROGRAM_STORAGE_KEY = 'winjayFreeVerifiedProgramV1';
const VERIFIED_QUEST_STORAGE_KEY = 'winjayVerifiedQuestV1';
const THEME_STORAGE_KEY = 'winjayThemeV1';
const FREE_VERIFIED_TOTAL = 1000;
const REFERRALS_REQUIRED = 10;
const MARKETPLACE_LISTINGS_STORAGE_KEY = 'marketplaceListingsV1';
const LISTING_IMAGES_BUCKET = 'listing-images';
const PROFILE_IMAGES_BUCKET = 'profile-images';
const MESSAGE_MEDIA_BUCKET = 'message-media';
const IDENTITY_DOCS_BUCKET = 'identity-docs';
const FREE_LISTING_LIMIT = 4;
const SELLER_PROFILE_LAST_TAG_STORAGE_KEY = 'winjayLastSellerProfileTagV1';

function safeStorageFilename(name) {
    return String(name || 'file').replace(/[^a-zA-Z0-9._-]/g, '_');
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

function isLoggedIn() {
    return !!currentSupabaseUserId;
}

function requireAuthOrPrompt() {
    if (isLoggedIn()) return true;
    showToast('Please log in to continue', 'log-in');
    openModal('loginModal');
    return false;
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
        pic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(short)}`,
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

function mapSupabaseListingRow(row, profilesById = {}) {
    const images = Array.isArray(row?.listing_images) ? row.listing_images.slice() : [];
    images.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
    const firstUrl = images[0]?.url || '';
    const ownerId = row?.owner_id || null;
    const profileRow = ownerId ? profilesById[ownerId] || null : null;
    const sellerFromProfile = profileRow ? mapProfileRowToSeller(profileRow) : buildSellerPlaceholder(ownerId);

    return {
        id: Number(row.id),
        owner_id: ownerId,
        title: row.title,
        description: row.description || '',
        subcategory: row.subcategory || '',
        price: Number(row.price) || 0,
        price_type: row.price_type || '',
        condition: row.condition || '',
        delivery: row.delivery || '',
        availability: row.availability || 'Available',
        category: row.category || '',
        image: firstUrl || 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?w=500',
        images: images.map((x) => x.url).filter(Boolean),
        city: row.city || '',
        contact_phone: row.contact_phone || '',
        tags: Array.isArray(row.tags) ? row.tags.filter(Boolean) : [],
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

async function fetchListingsFromSupabase({ silent = false, includeProfiles = false, limit = 200 } = {}) {
    const client = initSupabase();
    if (!client) return;
    let query = client
        .from('listings')
        .select(
            'id, created_at, owner_id, title, description, condition, price_type, delivery, availability, city, contact_phone, tags, subcategory, price, category, wilaya, status, views_count, likes_count, listing_images(url, sort_order)'
        )
        .order('created_at', { ascending: false });
    const safeLimit = Number(limit) || 0;
    if (safeLimit > 0) query = query.limit(safeLimit);
    const { data, error } = await query;
    if (error) {
        if (!silent) showToast(error.message || 'Failed to load listings', 'alert-circle');
        return;
    }
    const ownerIds = includeProfiles ? Array.from(new Set((data || []).map((r) => r?.owner_id).filter(Boolean))) : [];
    const profilesById = includeProfiles && ownerIds.length ? await fetchProfilesByIds(ownerIds) : {};
    listings = (data || []).map((row) => mapSupabaseListingRow(row, profilesById));
    saveMarketplaceListingsToStorage();
    syncMyListingsFromListings();
    renderListings();
    renderMyListings();
    await refreshFavoritesFromSupabase({ silent: true });
    renderListings();
    renderFavorites();
}

function loadMarketplaceListingsFromStorage() {
    try {
        const raw = localStorage.getItem(MARKETPLACE_LISTINGS_STORAGE_KEY);
        if (!raw) return;
        const saved = JSON.parse(raw);
        if (!Array.isArray(saved)) return;
        const cleaned = saved
            .filter((x) => x && typeof x === 'object')
            .map((x) => ({
                id: x.id,
                title: String(x.title || ''),
                price: Number.isFinite(Number(x.price)) ? Number(x.price) : 0,
                category: String(x.category || ''),
                image: String(x.image || ''),
                location: String(x.location || ''),
                date: String(x.date || ''),
                seller: x.seller && typeof x.seller === 'object' ? x.seller : null,
                reviewsData: Array.isArray(x.reviewsData) ? x.reviewsData : []
            }))
            .filter((x) => x.title && x.category && x.location);
        listings = cleaned;
    } catch (e) {
        return;
    }
}

function saveMarketplaceListingsToStorage() {
    try {
        localStorage.setItem(MARKETPLACE_LISTINGS_STORAGE_KEY, JSON.stringify(listings));
    } catch (e) {
        null;
    }
}

function syncMyListingsFromListings() {
    myListings = listings.filter((l) => l?.owner_id && currentSupabaseUserId && l.owner_id === currentSupabaseUserId);
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
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        handleAuthSessionChange(session);
    });
    return supabaseClient;
}

function applyAuthSessionToLocalState(session) {
    const user = session?.user || null;
    currentSupabaseUserId = user?.id || null;
    currentSupabaseUserEmail = user?.email || '';

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
    const meta = user.user_metadata || {};
    const fullName = meta.full_name || meta.name || meta.fullName || '';
    const tag = meta.tag || meta.username || meta.handle || '';
    const avatar = meta.avatar_url || meta.picture || '';

    userProfile = {
        ...createEmptyUserProfile(),
        ...userProfile,
        name: fullName || user.email || 'User',
        tag: tag || `@${user.id.slice(0, 8)}`,
        profilePic: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.id)}`,
        joinedDate: user.created_at
            ? new Date(user.created_at).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })
            : userProfile.joinedDate
    };

    saveUserProfileToStorage();
    syncMyListingsFromListings();
    updateProfileUI();
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
    userProfile = {
        ...createEmptyUserProfile(),
        ...userProfile,
        name: row.display_name || userProfile.name,
        tag: row.tag || userProfile.tag,
        profilePic:
            pickFirstValue(row, ['avatar_url', 'profile_pic', 'profilePic', 'picture', 'photo_url']) || userProfile.profilePic,
        coverPic: pickFirstValue(row, ['cover_url', 'cover_pic', 'coverPic', 'cover_url']) || userProfile.coverPic,
        location: row.location || userProfile.location,
        businessType: row.business_type || row.businessType || userProfile.businessType,
        phone: row.phone || row.phone_number || row.phoneNumber || userProfile.phone,
        workCategory: row.work_category || row.workCategory || row.category || userProfile.workCategory,
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

async function handleAuthSessionChange(session) {
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
        const row = await ensureSupabaseProfileRow(supabaseClient, data.session.user);
        if (row) applySupabaseProfileRowToLocalState(row, data.session.user);
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
        localStorage.setItem(USER_PROFILE_STORAGE_KEY, JSON.stringify(userProfile));
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
        lucide.createIcons();
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
    handleSearch('mobileSearchExpandInput');
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
    handleSearch(inputId);
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
    lucide.createIcons();
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
                    ${!p.hasBasics ? actionBtn('Edit', 'pencil', "openModal('editProfileModal'); lucide.createIcons();") : ''}
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
                    ${!p.hasPhone ? actionBtn('Add', 'pencil', "openModal('editProfileModal'); lucide.createIcons();") : ''}
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
                    ${!p.hasWork ? actionBtn('Choose', 'pencil', "openModal('editProfileModal'); lucide.createIcons();") : ''}
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
                    ${!p.hasIdentity && identityStatus !== 'pending' ? actionBtn(identityStatus === 'rejected' ? 'Resubmit' : 'Verify', 'upload', "openModal('identityVerificationModal'); lucide.createIcons();") : ''}
                    ${identityMark()}
                </div>
            </div>
        </div>
        <div class="ref-link-box">
            <code id="refLinkCode">${referralLink}</code>
            ${actionBtn('Copy', 'copy', "copyReferralLink()")}
        </div>
    `;

    lucide.createIcons();
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
    select.innerHTML = '<option value="">Select...</option>';
    const names = [
        ...categories.filter(c => c.special !== 'other').map(c => c.name),
        ...allExtraCategories.map(c => c.name)
    ];
    [...new Set(names)].forEach((name) => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        select.appendChild(opt);
    });
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
    { name: "Amine Tech", tag: "@amine_dz", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amine", cover: "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?w=1200", verified: true, vip: true, location: "Alger", businessType: "Magasin d'électronique", joinedDate: "Janvier 2023", rating: 4.9, reviews: 156, reviewsData: [] },
    { name: "Sarah Immo", tag: "@sarah_immobilier", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", cover: "https://images.unsplash.com/photo-1449844908441-8829872d2607?w=1200", verified: true, location: "Oran", businessType: "Agence Immobilière", joinedDate: "Mars 2022", rating: 4.7, reviews: 89, reviewsData: [] },
    { name: "Karim Auto", tag: "@karim_cars", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karim", cover: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200", verified: false, vip: true, location: "Constantine", businessType: "Vendeur de véhicules", joinedDate: "Juin 2023", rating: 4.5, reviews: 42, reviewsData: [] },
    { name: "Lina Fashion", tag: "@lina_style", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lina", cover: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200", verified: true, location: "Alger", businessType: "Boutique de Mode", joinedDate: "Novembre 2023", rating: 4.8, reviews: 67, reviewsData: [] },
    { name: "Yacine Informatique", tag: "@yacine_it", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yacine", cover: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200", verified: false, location: "Sétif", businessType: "Services Informatiques", joinedDate: "Février 2024", rating: 4.6, reviews: 28, reviewsData: [] }
] : [];

const reviewers = DEMO_MODE ? [
    { name: "Mohamed", tag: "@mohamed_dz", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mohamed", location: "Alger", businessType: "Particulier", joinedDate: "Janvier 2024", rating: 4.5, reviews: 5, reviewsData: [] },
    { name: "Lydia", tag: "@lydia_b", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lydia", location: "Oran", businessType: "Particulier", joinedDate: "Mars 2024", rating: 4.2, reviews: 3, reviewsData: [] },
    { name: "Ryad", tag: "@ryad_k", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ryad", location: "Alger", businessType: "Passionné Tech", joinedDate: "Février 2024", rating: 4.8, reviews: 12, reviewsData: [] },
    { name: "Sonia", tag: "@sonia_tech", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sonia", location: "Constantine", businessType: "Particulier", joinedDate: "Avril 2024", rating: 4.6, reviews: 8, reviewsData: [] },
    { name: "Imad", tag: "@imad_ed", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Imad", location: "Sétif", businessType: "Particulier", joinedDate: "Mai 2024", rating: 4.4, reviews: 6, reviewsData: [] },
    { name: "Ahmed", tag: "@ahmed_dz", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmed", location: "Béjaïa", businessType: "Particulier", joinedDate: "Janvier 2024", rating: 4.7, reviews: 15, reviewsData: [] },
    { name: "Fatiha", tag: "@fatiha_w", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fatiha", location: "Alger", businessType: "Particulier", joinedDate: "Mars 2024", rating: 4.9, reviews: 20, reviewsData: [] },
    { name: "Kamel", tag: "@kamel_s", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Kamel", location: "Tlemcen", businessType: "Particulier", joinedDate: "Février 2024", rating: 4.3, reviews: 4, reviewsData: [] },
    { name: "Yanis", tag: "@yanis_j", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Yanis", location: "Alger", businessType: "Particulier", joinedDate: "Avril 2024", rating: 4.5, reviews: 7, reviewsData: [] },
    { name: "Amel", tag: "@amel_z", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amel", location: "Annaba", businessType: "Particulier", joinedDate: "Mai 2024", rating: 4.6, reviews: 9, reviewsData: [] }
] : [];

const comments = [
    "Excellent service, je recommande vivement !", "Produit conforme à la description, très satisfait.", "Livraison un peu lente mais le vendeur est sérieux.", "Prix très compétitifs par rapport au marché.", "Super communication, transaction fluide.", "C'est ma troisième commande chez ce vendeur, toujours top.", "Un peu déçu par l'emballage mais l'article est nickel.", "Honnête et professionnel. Allez-y les yeux fermés.", "Meilleur rapport qualité-prix sur Winjay.", "Vendeur très réactif aux messages."
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
    { id: 2, title: "PC Gamer RTX 4080", price: 350000, category: "Électronique", image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500", location: "31 Oran", date: "Il y a 5 heures", seller: botProfiles[0] },
    { id: 3, title: "Mercedes Benz Classe C 2022", price: 8500000, category: "Véhicules", image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=500", location: "25 Constantine", date: "Hier", seller: botProfiles[2] },
    { id: 4, title: "Villa F5 avec Piscine", price: 45000000, category: "Immobilier", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500", location: "42 Tipaza", date: "Il y a 1 heure", seller: botProfiles[1] },
    { id: 5, title: "iPhone 15 Pro Max 256GB", price: 210000, category: "Téléphonie", image: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500", location: "16 Alger", date: "Il y a 3 heures", seller: botProfiles[0] },
    { id: 6, title: "Volkswagen Golf 8 R-Line", price: 6200000, category: "Véhicules", image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500", location: "09 Blida", date: "Il y a 6 heures", seller: botProfiles[2] },
    { id: 7, title: "Canapé d'angle Moderne", price: 85000, category: "Maison & Jardin", image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500", location: "19 Sétif", date: "Hier", seller: botProfiles[4] },
    { id: 8, title: "MacBook Pro M3 14\"", price: 380000, category: "Informatique", image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500", location: "31 Oran", date: "Il y a 2 jours", seller: botProfiles[0] },
    { id: 9, title: "Montre Rolex Submariner", price: 1800000, category: "Mode & Beauté", image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500", location: "16 Alger", date: "Il y a 4 heures", seller: botProfiles[3] },
    { id: 10, title: "Appareil Photo Sony A7IV", price: 320000, category: "Électronique", image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500", location: "23 Annaba", date: "Hier", seller: botProfiles[0] },
    { id: 11, title: "VTT Rockrider ST 540", price: 55000, category: "Sport & Santé", image: "https://images.unsplash.com/photo-1576435728678-68d0fbf94e91?w=500", location: "06 Béjaïa", date: "Il y a 8 heures", seller: botProfiles[4] },
    { id: 12, title: "Console PS5 Slim + 2 Manettes", price: 115000, category: "Électronique", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500", location: "15 Tizi Ouzou", date: "Aujourd'hui", seller: botProfiles[0] },
    { id: 13, title: "Terrain Agricole 2 Hectares", price: 12000000, category: "Immobilier", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500", location: "27 Mostaganem", date: "Il y a 3 jours", seller: botProfiles[1] },
    { id: 14, title: "Robot de Cuisine Thermomix", price: 145000, category: "Maison & Jardin", image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500", location: "16 Alger", date: "Hier", seller: botProfiles[4] },
    { id: 15, title: "Baskets Nike Air Jordan 1", price: 28000, category: "Mode & Beauté", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=500", location: "31 Oran", date: "Il y a 12 heures", seller: botProfiles[3] },
    { id: 16, title: "Tablette iPad Air M2", price: 165000, category: "Informatique", image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=500", location: "25 Constantine", date: "Il y a 5 heures", seller: botProfiles[0] },
    { id: 17, title: "Moto TMAX 560 Tech Max", price: 2600000, category: "Véhicules", image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=500", location: "16 Alger", date: "Hier", seller: botProfiles[2] },
    { id: 18, title: "Machine à Café Delonghi", price: 95000, category: "Maison & Jardin", image: "https://images.unsplash.com/photo-1520970014086-2208d157c9e2?w=500", location: "13 Tlemcen", date: "Il y a 2 jours", seller: botProfiles[4] },
    { id: 19, title: "Drone DJI Mini 4 Pro", price: 195000, category: "Électronique", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=500", location: "16 Alger", date: "Aujourd'hui", seller: botProfiles[0] },
    { id: 20, title: "Studio Meublé à Hydra", price: 75000, category: "Immobilier", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500", location: "16 Alger", date: "Il y a 7 heures", seller: botProfiles[1] },
    { id: 21, title: "Piano Numérique Yamaha", price: 125000, category: "Loisirs & Divertissement", image: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500", location: "31 Oran", date: "Hier", seller: botProfiles[4] },
    { id: 22, title: "Perceuse Bosch Professional", price: 18500, category: "Matériel Professionnel", image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500", location: "19 Sétif", date: "Il y a 1 jour", seller: botProfiles[0] },
    { id: 23, title: "Sac à Main Louis Vuitton", price: 240000, category: "Mode & Beauté", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500", location: "16 Alger", date: "Hier", seller: botProfiles[3] },
    { id: 24, title: "Écran Samsung Odyssey G7", price: 110000, category: "Informatique", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500", location: "31 Oran", date: "Il y a 4 heures", seller: botProfiles[0] },
    { id: 25, title: "Canne à Pêche Carbone", price: 12000, category: "Loisirs & Divertissement", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500", location: "21 Skikda", date: "Hier", seller: botProfiles[4] },
    { id: 26, title: "Vélo d'appartement Pro", price: 42000, category: "Sport & Santé", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500", location: "16 Alger", date: "Il y a 2 jours", seller: botProfiles[4] },
    { id: 27, title: "Casque Bose QC45", price: 58000, category: "Électronique", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", location: "31 Oran", date: "Hier", seller: botProfiles[0] },
    { id: 28, title: "Offre d'emploi: Développeur Frontend (Remote)", price: 0, category: "Emploi & Services", image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500", location: "16 Alger", date: "Aujourd'hui", seller: botProfiles[4] },
    { id: 29, title: "Service: Plombier à domicile (Urgence 24/7)", price: 2500, category: "Emploi & Services", image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=500", location: "31 Oran", date: "Il y a 3 heures", seller: botProfiles[2] },
    { id: 30, title: "Cours particuliers: Maths & Physique (Lycée)", price: 1500, category: "Emploi & Services", image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500", location: "25 Constantine", date: "Il y a 1 jour", seller: botProfiles[1] },
    { id: 31, title: "Samsung Galaxy S24 Ultra 256GB", price: 195000, category: "Téléphonie", image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500", location: "16 Alger", date: "Il y a 6 heures", seller: botProfiles[0] },
    { id: 32, title: "Xiaomi Redmi Note 13 Pro (Neuf)", price: 52000, category: "Téléphonie", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500", location: "19 Sétif", date: "Hier", seller: botProfiles[4] },
    { id: 33, title: "Générateur Inverter 3.5kW (Professionnel)", price: 145000, category: "Matériel Professionnel", image: "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=500", location: "42 Tipaza", date: "Il y a 2 jours", seller: botProfiles[0] },
    { id: 34, title: "Caisse enregistreuse + TPE (Pack commerce)", price: 68000, category: "Matériel Professionnel", image: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=500", location: "31 Oran", date: "Il y a 4 jours", seller: botProfiles[3] }
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
let confirmCallback = null;
let currentListingDetailId = null;
let currentSellerProfileTag = null;
let currentSellerProfileOwnerId = null;
let currentSellerProfileName = '';
const listingReviewPanelState = {};
const listingDetailImageIndex = {};
const listingReviewsCache = new Map();
const profileRatingSummaryCache = new Map();
const profileFollowCountsCache = new Map();
const profileFollowStateCache = new Map();
const sellerProfileReviewsCache = new Map();
let listingDetailViewRecordedListingId = null;
let listingDetailViewRecorded = false;

let mockChats = DEMO_MODE ? {
    "@amine_dz": {
        name: "Amine Tech",
        pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amine",
        verified: true,
        vip: true,
        messages: [
            { type: "received", text: "Bonjour, est-ce que l'article est toujours disponible ?", time: "Il y a 10 min" },
            { type: "sent", text: "Bonjour ! Oui, l'article est toujours disponible.", time: "Il y a 5 min" }
        ]
    },
    "@sarah_immobilier": {
        name: "Sarah Immo",
        pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        verified: true,
        vip: false,
        messages: [
            { type: "received", text: "Merci pour votre intérêt !", time: "Il y a 2 heures" }
        ]
    },
    "@karim_cars": {
        name: "Karim Auto",
        pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karim",
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

const WINJAY_LOGO_FILENAME = 'new official winjay dz logo.png';
const WINJAY_LOGO_FILENAME_ENCODED = 'new%20official%20winjay%20dz%20logo.png';
const winjayTransparentLogoCache = new Map();
const winjayTransparentLogoPromiseCache = new Map();

function isWinjayLogoSrc(src) {
    if (!src) return false;
    const s = String(src).toLowerCase();
    return s.includes(WINJAY_LOGO_FILENAME) || s.includes(WINJAY_LOGO_FILENAME_ENCODED);
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
    lucide.createIcons();
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
    lucide.createIcons();
}

function newMessageId() {
    return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

function renderChatMessageBody(m) {
    const kind = m.kind || (m.url ? 'file' : 'text');
    if (kind === 'image') {
        return `<img src="${m.url}" alt="${escapeHtml(m.name || 'Image')}" class="chat-media image" onclick="openLightbox('${m.url}')">`;
    }
    if (kind === 'video') {
        return `<video src="${m.url}" controls class="chat-media"></video>`;
    }
    if (kind === 'audio') {
        const id = escapeHtml(m.id || '');
        return `
            <div class="voice-message" data-voice-id="${id}">
                <button class="voice-play" onclick="toggleVoicePlayback('${id}')"><i data-lucide="play"></i></button>
                <div class="voice-wave" onclick="seekVoice(event, '${id}')"><div class="voice-wave-fill"></div></div>
                <div class="voice-times">
                    <span class="voice-current">0:00</span>
                    <span class="voice-duration">0:00</span>
                </div>
                <audio class="voice-audio" preload="metadata" src="${m.url}"></audio>
            </div>
        `;
    }
    if (kind === 'file') {
        const name = escapeHtml(m.name || 'Fichier');
        return `<a class="chat-file" href="${m.url}" download="${name}"><i data-lucide="file"></i><span>${name}</span></a>`;
    }
    return `<p>${escapeHtml(m.text || '')}</p>`;
}

function getChatPreviewText(m) {
    const kind = m?.kind || (m?.url ? 'file' : 'text');
    if (kind === 'image') return 'Photo';
    if (kind === 'video') return 'Vidéo';
    if (kind === 'audio') return 'Message vocal';
    if (kind === 'file') return m?.name ? `Fichier: ${m.name}` : 'Fichier';
    return m?.text || '';
}

async function sendChatMediaMessage({ kind, file, blob, name } = {}) {
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

    const pendingId = newMessageId();
    const localUrl = URL.createObjectURL(source);
    chat.messages.push({ id: pendingId, type: 'sent', kind, url: localUrl, name: fileName, time: "À l'instant" });
    await switchChat(activeChatTag);

    const safeName = safeStorageFilename(fileName);
    const objectPath = `${currentSupabaseUserId}/${chat.userId}/${Date.now()}_${pendingId}_${safeName}`;

    const { error: uploadError } = await client.storage.from(MESSAGE_MEDIA_BUCKET).upload(objectPath, source, {
        contentType: mime || undefined,
        upsert: false
    });
    if (uploadError) {
        showToast(uploadError.message || 'Failed to upload media', 'alert-circle');
        try { URL.revokeObjectURL(localUrl); } catch {}
        await refreshLiveChatsFromSupabase();
        renderMessagesList();
        await switchChat(activeChatTag);
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
        try { URL.revokeObjectURL(localUrl); } catch {}
        await refreshLiveChatsFromSupabase();
        renderMessagesList();
        await switchChat(activeChatTag);
        return;
    }

    try { URL.revokeObjectURL(localUrl); } catch {}
    await refreshLiveChatsFromSupabase();
    renderMessagesList();
    await switchChat(activeChatTag);
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
    lucide.createIcons();
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
        lucide.createIcons();
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
        lucide.createIcons();
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
    lucide.createIcons();
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
    lucide.createIcons();
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

function toggleVoiceRecording() {
    if (voiceRecorder && voiceRecorder.state === 'recording') {
        stopVoiceRecording(true);
        return;
    }
    startVoiceRecording();
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
    messagesEl.scrollTop = messagesEl.scrollHeight;
    updateChatJumpLatestButton();
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

function isPublicProfilesBackendMissing(error) {
    const msg = String(error?.message || '');
    return msg.toLowerCase().includes('relation') && msg.toLowerCase().includes('public_profiles');
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
        lucide.createIcons();
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
                seller = { name: 'Winjay', tag: '', pic: `https://api.dicebear.com/7.x/avataaars/svg?seed=Winjay` };
                text = 'approved your identity verification';
            }
            else if (r.type === 'identity_rejected') {
                seller = { name: 'Winjay', tag: '', pic: `https://api.dicebear.com/7.x/avataaars/svg?seed=Winjay` };
                text = 'rejected your identity verification';
            }
            else if (r.type === 'verified_granted') {
                seller = { name: 'Winjay', tag: '', pic: `https://api.dicebear.com/7.x/avataaars/svg?seed=Winjay` };
                text = 'your account is now Verified';
            }
            else if (r.type === 'listing_view_milestone') {
                const milestone = Number(meta.milestone) || Number(meta.views) || 0;
                seller = { name: 'Winjay', tag: '', pic: `https://api.dicebear.com/7.x/avataaars/svg?seed=Winjay` };
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
    lucide.createIcons();
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
    const payload = {
        recipient_id: recipient,
        actor_id: currentSupabaseUserId,
        type: String(type || '').trim() || 'notification',
        meta: meta && typeof meta === 'object' ? meta : {}
    };
    if (listingId !== null && listingId !== undefined) payload.listing_id = Number(listingId);
    if (targetProfileId) payload.target_profile_id = String(targetProfileId);
    const { error } = await client.from('notifications').insert(payload);
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
    lucide.createIcons();
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
    }
    if (btn) btn.disabled = false;
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
    if (render) renderListings();
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

function renderListingReviewsListHTML(reviewsData) {
    const rows = Array.isArray(reviewsData) ? reviewsData : [];
    if (!rows.length) return '<p style="color: var(--text-muted);">Aucun avis pour le moment.</p>';
    return rows
        .map((r) => {
            const rating = Math.max(0, Math.min(5, Number(r.rating) || 0));
            const tag = String(r.tag || '@user');
            const user = escapeHtml(r.user || 'User');
            const date = escapeHtml(r.date || '');
            const pic = String(r.pic || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(tag)}`);
            const comment = String(r.comment || '');
            return `
            <div class="review-item">
                <img src="${pic}" class="review-avatar clickable" alt="${user}" onclick="openSellerProfile('${tag}')">
                <div class="review-content-wrapper">
                    <div class="review-header">
                        <span class="review-user clickable" onclick="openSellerProfile('${tag}')">${user}</span>
                        <span class="review-date">${date}</span>
                    </div>
                    <div class="stars" style="margin-bottom: 8px;">
                        ${Array(5)
                            .fill(0)
                            .map((_, i) => `<i data-lucide="star" style="${i < rating ? 'fill: #ffb400;' : ''} width: 12px; height: 12px;"></i>`)
                            .join('')}
                    </div>
                    <div class="review-comment">${comment}</div>
                </div>
            </div>
        `;
        })
        .join('');
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

    lucide.createIcons();
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
            pic: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(r.author_id || 'user'))}`,
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

async function startChatWithSellerByOwnerId(ownerId) {
    if (!ownerId) return;
    if (!requireAuthOrPrompt()) return;
    if (DEMO_MODE) return;
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
                await refreshLiveChatsFromSupabase();
                renderMessagesList();
                if (activeChatTag && mockChats[activeChatTag]?.userId === row.sender_id) {
                    await switchChat(activeChatTag);
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
        const prev = lastUnreadMessageCount;
        const next = await refreshUnreadMessageCount();
        if (next !== prev) {
            await refreshLiveChatsFromSupabase();
            renderMessagesList();
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

function getViewTrackingKey() {
    if (currentSupabaseUserId) return String(currentSupabaseUserId);
    return `anon:${getAnonVisitorId()}`;
}

function getCurrentSectionId() {
    const el = document.querySelector('.content-section.active');
    return el?.id || 'home-section';
}

function updateLivePresence() {
    if (DEMO_MODE) return;
    const client = initSupabase();
    if (!client) return;
    if (!livePresenceChannel) return;
    const payload = {
        user_id: currentSupabaseUserId || null,
        section: getCurrentSectionId(),
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
        const icon = activeVoiceContainer.querySelector('.voice-play i');
        icon?.setAttribute('data-lucide', 'play');
        const fill = activeVoiceContainer.querySelector('.voice-wave-fill');
        if (fill) fill.style.width = '0%';
        const currentEl = activeVoiceContainer.querySelector('.voice-current');
        if (currentEl) currentEl.textContent = '0:00';
    }
    activeVoiceAudio = null;
    activeVoiceContainer = null;
    lucide.createIcons();
}

function getVoiceContainerById(voiceId) {
    return document.querySelector(`.voice-message[data-voice-id="${CSS.escape(voiceId)}"]`);
}

function syncVoiceUI(container, audio) {
    const fill = container.querySelector('.voice-wave-fill');
    const currentEl = container.querySelector('.voice-current');
    const durationEl = container.querySelector('.voice-duration');
    const duration = audio.duration || 0;
    const current = audio.currentTime || 0;
    if (fill) fill.style.width = duration > 0 ? `${(current / duration) * 100}%` : '0%';
    if (currentEl) currentEl.textContent = formatTime(current);
    if (durationEl) durationEl.textContent = formatTime(duration);
}

function initVoiceMessage(container) {
    const audio = container.querySelector('.voice-audio');
    if (!audio) return;

    audio.onloadedmetadata = () => syncVoiceUI(container, audio);
    audio.ontimeupdate = () => syncVoiceUI(container, audio);
    audio.onended = () => {
        const icon = container.querySelector('.voice-play i');
        icon?.setAttribute('data-lucide', 'play');
        const fill = container.querySelector('.voice-wave-fill');
        if (fill) fill.style.width = '0%';
        const currentEl = container.querySelector('.voice-current');
        if (currentEl) currentEl.textContent = '0:00';
        const durationEl = container.querySelector('.voice-duration');
        if (durationEl) durationEl.textContent = formatTime(audio.duration || 0);
        if (activeVoiceAudio === audio) {
            activeVoiceAudio = null;
            activeVoiceContainer = null;
        }
        lucide.createIcons();
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

    const icon = container.querySelector('.voice-play i');
    if (audio.paused) {
        audio.play().then(() => {
            activeVoiceAudio = audio;
            activeVoiceContainer = container;
            icon?.setAttribute('data-lucide', 'pause');
            lucide.createIcons();
        }).catch(() => {
            showToast('Impossible de lire l’audio', 'alert-circle');
        });
    } else {
        audio.pause();
        icon?.setAttribute('data-lucide', 'play');
        lucide.createIcons();
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
        lucide.createIcons();
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
        lucide.createIcons();
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

    lucide.createIcons();
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

async function startChatWithSeller(tag) {
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
            pic: seller?.pic || seller?.profilePic || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Seller',
            verified: !!seller?.verified,
            vip: !!(seller?.vip || seller?.isVip),
            messages: []
        };
    }

    activeChatTag = tag;
    showSection('messages-section');
    renderMessagesList();
    switchChat(tag);
}

async function switchChat(tag, isModal = false) {
    const chat = mockChats[tag];
    if (!chat) {
        activeChatTag = null;
        renderEmptyChat();
        lucide.createIcons();
        return;
    }

    closeChatActions();
    const previousActiveChatTag = activeChatTag;
    activeChatTag = tag;

    if (!DEMO_MODE && currentSupabaseUserId && chat.userId) {
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

    chatMessages.innerHTML = chat.messages.map(m => `
        <div class="chat-message ${m.type}">
            ${renderChatMessageBody(m)}
            <span>${escapeHtml(m.time || '')}</span>
        </div>
    `).join('');
    if (!isModal) renderMessagesList();
    initVoiceMessagesInChat(chatMessages);

    if (wasNearBottom) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } else {
        chatMessages.scrollTop = prevScrollTop;
    }
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
    lucide.createIcons();
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
    wilaya: '',
    priceMin: '',
    priceMax: '',
    sort: 'newest'
};
let currentPage = 1;
const ITEMS_PER_PAGE = 12;
const MAX_PAGE_BUTTONS = 9;

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
    { name: "Véhicules", icon: "car" }, { name: "Immobilier", icon: "home" }, { name: "Électronique", icon: "smartphone" },
    { name: "Emploi & Services", icon: "briefcase" }, { name: "Maison & Jardin", icon: "armchair" }, { name: "Mode & Beauté", icon: "shopping-bag" },
    { name: "Loisirs & Divertissement", icon: "palmtree" }, { name: "Informatique", icon: "monitor" }, { name: "Téléphonie", icon: "phone" },
    { name: "Sport & Santé", icon: "heart-pulse" }, { name: "Matériel Professionnel", icon: "wrench" },
    { name: "Autres", icon: "more-horizontal", special: "other" }
];

const listingSubcategoriesByCategory = {
    "Véhicules": ["Voitures", "Motos & Scooters", "Camions & Utilitaires", "Pièces & Accessoires", "Location de voitures"],
    "Immobilier": ["Appartements", "Maisons", "Studios", "Terrains", "Locaux commerciaux", "Bureaux", "Colocation", "Locations vacances"],
    "Électronique": ["TV & Audio", "Caméras", "Consoles & Jeux", "Électroménager", "Accessoires", "Imprimantes"],
    "Informatique": ["PC Portables", "PC Bureau", "Composants (GPU/CPU/RAM)", "Écrans", "Réseaux", "Stockage (SSD/HDD)", "Logiciels"],
    "Téléphonie": ["Smartphones", "Téléphones simples", "Tablettes", "Accessoires (chargeur/écouteurs)", "Réparation"],
    "Emploi & Services": ["Offres d’emploi", "Recherche d’emploi", "Services à domicile", "Cours & formations", "Transport", "Événementiel", "Freelance"],
    "Maison & Jardin": ["Meubles", "Décoration", "Jardinage", "Bricolage/Outillage", "Linge maison", "Cuisine"],
    "Mode & Beauté": ["Vêtements", "Chaussures", "Sacs", "Montres", "Bijoux", "Parfums & Cosmétiques"],
    "Loisirs & Divertissement": ["Sports & fitness", "Musique & instruments", "Livres", "Jeux & jouets", "Voyage & loisirs", "Billetterie"],
    "Sport & Santé": ["Matériel sport", "Vélos", "Compléments", "Bien-être", "Équipement salle de sport"],
    "Matériel Professionnel": ["Restauration (café/hôtel)", "Industrie", "Construction/BTP", "Agriculture", "Matériel bureau", "Outillage pro"]
};

const allExtraCategories = [
    { name: "Pièces de rechange", icon: "settings" }, { name: "Motos & Vélos", icon: "bike" }, { name: "Nautisme", icon: "ship" },
    { name: "Locations de vacances", icon: "palmtree" }, { name: "Bureaux & Commerces", icon: "building" }, { name: "Colocation", icon: "users" },
    { name: "Consoles & Jeux vidéo", icon: "gamepad-2" }, { name: "Photo & Caméras", icon: "camera" }, { name: "Audio & Son", icon: "speaker" },
    { name: "Meubles", icon: "table" }, { name: "Électroménager", icon: "refrigerator" }, { name: "Bricolage", icon: "hammer" },
    { name: "Jardinage", icon: "leaf" }, { name: "Décoration", icon: "palette" }, { name: "Linge de maison", icon: "shirt" },
    { name: "Vêtements", icon: "shirt" }, { name: "Chaussures", icon: "footprints" }, { name: "Accessoires & Montres", icon: "watch" },
    { name: "Bijoux", icon: "gem" }, { name: "Sacs & Bagages", icon: "shopping-bag" },
    { name: "Vêtements bébé", icon: "baby" }, { name: "Équipement bébé", icon: "package" }, { name: "Jeux & Jouets", icon: "puzzle" },
    { name: "Livres", icon: "book" }, { name: "Musique & CD", icon: "music" }, { name: "Films & DVD", icon: "film" },
    { name: "Instruments de musique", icon: "guitar" }, { name: "Collection", icon: "stamp" }, { name: "Art & Artisanat", icon: "brush" },
    { name: "Animaux de compagnie", icon: "dog" }, { name: "Accessoires animaux", icon: "bone" },
    { name: "Alimentation", icon: "utensils" }, { name: "Santé & Bien-être", icon: "heart" }, { name: "Services à la personne", icon: "user-cog" },
    { name: "Événementiel", icon: "calendar" }, { name: "Cours & Formations", icon: "graduation-cap" }, { name: "Informatique & Logiciels", icon: "code" },
    { name: "Matériel de bureau", icon: "printer" }, { name: "Hôtellerie & Restauration", icon: "coffee" }, { name: "Agriculture", icon: "tractor" },
    { name: "Bâtiment & Travaux", icon: "hard-hat" }, { name: "Industrie", icon: "factory" }, { name: "Outillage", icon: "drill" },
    { name: "Énergie", icon: "zap" }, { name: "Transport & Logistique", icon: "truck" }, { name: "Beauté & Cosmétique", icon: "sparkles" },
    { name: "Voyages", icon: "plane" }, { name: "Art antiquités", icon: "castle" }, { name: "Vins & Gastronomie", icon: "glass-water" },
    { name: "Billetterie", icon: "ticket" }, { name: "Emploi intérim", icon: "clock" }
];

function ensureCategoryListings() {
    const adjectives = ["Neuf", "Bon plan", "Premium", "Top qualité", "À saisir"];
    const genericImages = [
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=500",
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=500",
        "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=500"
    ];

    const imageByCategory = {
        "Véhicules": "https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500",
        "Immobilier": "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=500",
        "Électronique": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500",
        "Emploi & Services": "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=500",
        "Maison & Jardin": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500",
        "Mode & Beauté": "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500",
        "Loisirs & Divertissement": "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500",
        "Informatique": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=500",
        "Téléphonie": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
        "Sport & Santé": "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
        "Matériel Professionnel": "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=500",
        "Autres": "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=500"
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
            if (categoryName === "Véhicules" || categoryName === "Motos & Vélos") price = rand(150000, 12000000);
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

document.addEventListener('DOMContentLoaded', async () => {
    setPendingReferralFromUrl();
    updateNavbarAuthUI();
    initSupabase();
    await bootstrapSupabaseAuth();
    bootstrapLivePresence();
    if (!supabaseClient) {
        loadUserProfileFromStorage();
    }
    populateWilayas();
    loadAlgeriaCommunesData();
    populateCategories();
    setupListingSubcategorySelects();
    setupListingCitySelects();
    setupListingCoreFieldBindings();
    populateFilterDropdowns();
    populateAllExtraCategories();
    populateWorkCategoriesSelect();
    setupCategoryPickers();
    setupSelectPickers();
    loadUserProfileImages();
    setupImageEditorDrag();
    handleIdentityFilePreview('idFrontInput', 'idFrontPreview');
    handleIdentityFilePreview('idBackInput', 'idBackPreview');
    updateFreeVerifiedCounterUI();
    setupMobileFooterDocking();
    setupPasswordNoSpaceInputs();
    loadThemeModeFromStorage();
    const settingsToggle = document.getElementById('defaultDarkMode');
    if (settingsToggle && !settingsToggle.dataset.bound) {
        settingsToggle.dataset.bound = '1';
        settingsToggle.addEventListener('change', () => {
            setThemeMode(!!settingsToggle.checked);
        });
    }
    applyWinjayLogoTheme();

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
    const listingIdFromUrl = Number(listingParam) || 0;
    const editIdFromUrl = Number(editParam) || 0;

    if (listingsGrid && (!Array.isArray(listings) || listings.length === 0)) {
        listingsGrid.innerHTML = getHomeListingsSkeletonHTML(12);
    }
    const listingsPromise = fetchListingsFromSupabase({ silent: false, includeProfiles: false, limit: 200 });

    if (profileParam) {
        const tag = profileParam.startsWith('@') ? profileParam : '@' + profileParam;
        showSection('seller-profile-section');
        const content = document.getElementById('externalProfileContent');
        if (content) {
            content.innerHTML = getSellerProfileSkeletonHTML();
        }
        await openSellerProfile(tag.toLowerCase(), 'listings', { pushState: false });
    } else if (newListingParam) {
        openCreateListingPage({ pushState: false });
    } else if (Number.isFinite(editIdFromUrl) && editIdFromUrl > 0) {
        await listingsPromise;
        openEditListingPageById(editIdFromUrl, { pushState: false });
    } else if (Number.isFinite(listingIdFromUrl) && listingIdFromUrl > 0) {
        await listingsPromise;
        openListingDetail(listingIdFromUrl, { pushState: false });
    } else {
        if (lastSection === 'seller-profile-section') {
            const storedTag = (localStorage.getItem(SELLER_PROFILE_LAST_TAG_STORAGE_KEY) || '').trim();
            if (storedTag) {
                showSection('seller-profile-section');
                const content = document.getElementById('externalProfileContent');
                if (content) {
                    content.innerHTML = getSellerProfileSkeletonHTML();
                }
                await openSellerProfile(storedTag.toLowerCase());
            } else {
                showSection('home-section');
            }
        } else {
            showSection(lastSection);
        }
    }

    if (DEMO_MODE) renderListings();
    updateProfileUI();
    renderFavorites();
    setupChatFeatures();
    setupMessagesTwitterUI();
    bindChatJumpLatestScroll();
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
    document.documentElement.classList.remove('app-loading');
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

function setupListingCitySelects() {
    const addWilaya = document.getElementById('listingWilaya');
    const addCity = document.getElementById('listingCity');
    const editWilaya = document.getElementById('editListingWilaya');
    const editCity = document.getElementById('editListingCity');

    if (addWilaya && addCity) {
        const refresh = () => populateCitySelect(addCity, addWilaya.value, '');
        addWilaya.addEventListener('change', refresh);
        refresh();
    }
    if (editWilaya && editCity) {
        const refresh = () => populateCitySelect(editCity, editWilaya.value, editCity.value || '');
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
    lucide.createIcons();
}

function populateListingSubcategorySelect(selectEl, mainCategory, selectedValue = '') {
    if (!selectEl) return;
    const main = String(mainCategory || '').trim();
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

function setupListingSubcategorySelects() {
    const mainAdd = document.getElementById('listingCategory');
    const subAdd = document.getElementById('listingSubcategory');
    const mainEdit = document.getElementById('editListingCategory');
    const subEdit = document.getElementById('editListingSubcategory');

    if (mainAdd && subAdd) {
        const refresh = () => populateListingSubcategorySelect(subAdd, mainAdd.value, '');
        mainAdd.addEventListener('change', refresh);
        refresh();
    }
    if (mainEdit && subEdit) {
        const refresh = () => populateListingSubcategorySelect(subEdit, mainEdit.value, subEdit.value || '');
        mainEdit.addEventListener('change', refresh);
        refresh();
    }
}

function populateAllExtraCategories() {
    const grid = document.getElementById('allCategoriesGrid');
    const combined = [...categories.filter(c => c.special !== 'other'), ...allExtraCategories];
    grid.innerHTML = combined.map(cat => `<div class="category-item" onclick="selectCategoryFromModal('${cat.name}')"><i data-lucide="${cat.icon}"></i><span>${cat.name}</span></div>`).join('');
    lucide.createIcons();
}

function openOtherCategoriesModal(clearTarget = false) {
    if (clearTarget) categoryPickerTargetSelectId = '';
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
            setTimeout(() => input.focus(), 80);
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
    lucide.createIcons();
}

function renderSelectPickerOptions(options, currentValue) {
    const list = document.getElementById('selectPickerList');
    if (!list) return;
    const cur = String(currentValue || '');
    list.innerHTML = (options || []).map((opt) => {
        const active = String(opt.value) === cur ? ' active' : '';
        const safeValue = String(opt.value).replace(/"/g, '&quot;');
        const safeLabel = String(opt.label).replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return `<button type="button" class="select-picker-option${active}" onclick="selectPickerChoose(&quot;${safeValue}&quot;)">${safeLabel}</button>`;
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
    const ids = ['editWorkCategory'];
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
    lucide.createIcons();
}

function openListingImagesModal() {
    openModal('listingImagesModal');
    renderListingImagesSlots();
    updateListingImagesMiniPreview();
    lucide.createIcons();
}

function closeListingImagesModal() {
    closeModal('listingImagesModal');
    updateListingImagesMiniPreview();
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
    sidebar.classList.toggle('active', !!isOpen);
    const overlay = document.getElementById('sidebarOverlay');
    overlay?.classList?.toggle('active', !!isOpen);
    try {
        document.body.classList.toggle('sidebar-open', !!isOpen);
    } catch (e) {
        null;
    }
}

function closeSidebarOverlay() {
    setSidebarMobileOpen(false);
}

sidebarToggle.addEventListener('click', () => {
    if (window.innerWidth <= 768) {
        setSidebarMobileOpen(!sidebar.classList.contains('active'));
    } else {
        sidebar.classList.toggle('collapsed');
        contentArea.classList.toggle('expanded');
    }
});

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
    if (modalId === 'otherCategoriesModal') {
        categoryPickerTargetSelectId = '';
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
    }
}

function openListingLimitModal(limit = FREE_LISTING_LIMIT) {
    const messageEl = document.getElementById('listingLimitMessage');
    if (messageEl) messageEl.textContent = `You reached your listing limit of ${limit}.`;
    openModal('listingLimitModal');
    lucide.createIcons();
}

function upgradeToVipFromListingLimit() {
    closeModal('listingLimitModal');
    showSection('home-section');
    openVipModal();
    lucide.createIcons();
}

function upgradeToVerifiedFromListingLimit() {
    closeModal('listingLimitModal');
    showSection('home-section');
    openVerifiedUpgradeModal();
    lucide.createIcons();
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
    if (next) lucide.createIcons();
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
    lucide.createIcons();
}

function openAuthGateRegister() {
    closeModal('authGateModal');
    openModal('registerModal');
    lucide.createIcons();
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
    lucide.createIcons();
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
        lucide.createIcons();
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

function applyImageChangesTemporary() {
    const exported = exportCroppedEditorImage(currentImageType);
    if (!exported) return;

    if (currentImageType === 'cover') {
        userProfile.coverPic = exported;
    } else {
        userProfile.profilePic = exported;
    }

    updateProfileUI();
    persistTemporaryProfileImageState(currentImageType, exported);
    closeModal('imageEditorModal');
    showToast('Temporary photo applied', 'clock');
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
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        if (event.target.id === 'confirmModal') {
            confirmCallback = null;
        }
    }
};

window.addEventListener('scroll', () => {
    const btn = document.getElementById('scrollTopBtn');
    if (window.scrollY > 500) {
        btn.classList.add('visible');
    } else {
        btn.classList.remove('visible');
    }
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

let selectedVipPlan = null;
let selectedVerifiedPlan = null;

function openVipModal() {
    if (userProfile?.isVip) {
        showToast('You are already VIP', 'check-circle');
        updateUpgradeOfferVisibility();
        return;
    }
    openModal('vipModal');
    lucide.createIcons();
}

function openVerifiedUpgradeModal() {
    if (userProfile?.verified) {
        showToast('You are already Verified', 'check-circle');
        updateUpgradeOfferVisibility();
        return;
    }
    openModal('verifiedUpgradeModal');
    lucide.createIcons();
}

function selectVipPlan(plan) {
    selectedVipPlan = plan;
    closeModal('vipModal');
    if (plan === 'monthly') {
        document.getElementById('codPlanName').textContent = 'Mensuel';
        document.getElementById('codPrice').textContent = '1,500 DZD/mois';
    } else {
        document.getElementById('codPlanName').textContent = 'Annuel';
        document.getElementById('codPrice').textContent = '10,800 DZD/an';
    }
    populateWilayasSelect('codWilaya');
    openModal('codModal');
    lucide.createIcons();
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
    const plan = selectedVipPlan || 'monthly';
    const { error } = await client.from('vip_applications').insert({
        user_id: userId,
        plan,
        phone,
        wilaya,
        status: 'pending'
    });
    if (error) {
        showToast(error.message || 'Failed to submit', 'alert-circle');
        return;
    }
    closeModal('codModal');
    showToast('Abonnement VIP confirmé ! Un agent vous contactera.', 'check-circle');
}

function selectVerifiedPlan(plan) {
    selectedVerifiedPlan = plan;
    closeModal('verifiedUpgradeModal');
    if (plan === 'monthly') {
        document.getElementById('verifiedPlanName').textContent = 'Mensuel';
        document.getElementById('verifiedPrice').textContent = '900 DZD/mois';
    } else {
        document.getElementById('verifiedPlanName').textContent = 'Annuel';
        document.getElementById('verifiedPrice').textContent = '7,500 DZD/an';
    }
    populateWilayasSelect('verifiedWilaya');
    openModal('verifiedCodModal');
    lucide.createIcons();
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
    const plan = selectedVerifiedPlan || 'monthly';
    const { error } = await client.from('verified_applications').insert({
        user_id: userId,
        plan,
        phone,
        wilaya,
        status: 'pending'
    });
    if (error) {
        showToast(error.message || 'Failed to submit', 'alert-circle');
        return;
    }
    closeModal('verifiedCodModal');
    showToast('Demande Vérifié envoyée ! Un agent vous contactera.', 'check-circle');
}

function openReportModal() {
    openModal('reportModal');
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

function openShareModal(listingId) {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    const urlObj = new URL(window.location.href);
    urlObj.searchParams.delete('new');
    urlObj.searchParams.set('listing', String(listingId));
    const url = encodeURIComponent(urlObj.toString());
    const shareText = encodeURIComponent(`Découvrez cette annonce: ${listing.title} - ${listing.price} DZD`);
    window.open(`https://t.me/share/url?url=${url}&text=${shareText}`, '_blank');
}

document.getElementById('addListingForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!requireAuthOrPrompt()) return;
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

        const title = document.getElementById('listingTitle').value.trim();
        const description = document.getElementById('listingDescription')?.value?.trim?.() || '';
        const condition = document.getElementById('listingCondition')?.value || '';
        const priceType = document.getElementById('listingPriceType')?.value || '';
        const price = Number(document.getElementById('listingPrice').value) || 0;
        const category = document.getElementById('listingCategory').value;
        const subcategory = document.getElementById('listingSubcategory')?.value || '';
        const wilaya = document.getElementById('listingWilaya').value;
        const city = document.getElementById('listingCity')?.value || '';
        const delivery = document.getElementById('listingDelivery')?.value || '';
        const contactPhone = document.getElementById('listingContactPhone')?.value?.trim?.() || '';
        const availability = document.getElementById('listingAvailability')?.value || 'Available';
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
                client.from('listings').select('id').eq('owner_id', userId).limit(FREE_LISTING_LIMIT + 1),
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
            for (let i = 0; i < imagePlan.length; i++) {
                const entry = imagePlan[i];
                if (entry.kind === 'existing') {
                    finalUrls.push(entry.url);
                    continue;
                }
                const f = entry.file;
                const safeName = String(f.name || 'photo').replace(/[^a-zA-Z0-9._-]/g, '_');
                const objectPath = `${userId}/${listingId}/${Date.now()}_${i + 1}_${safeName}`;
                objectPaths.push(objectPath);
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
            }
            const { error: updateErr } = await withTimeout(
                client
                    .from('listings')
                    .update({
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
                        tags: tags.length ? tags : null
                    })
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
            const imageRows = finalUrls.map((u, i) => ({ listing_id: listingId, url: u, sort_order: i + 1 }));
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
            showToast('Listing updated!', 'check-circle');
            editingListingId = null;
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
                    status: 'active'
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
            imageRows.push({ listing_id: listingId, url: publicUrl, sort_order: i + 1 });
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

    const location = document.getElementById('editLocation').value;
    const businessType = document.getElementById('editBusinessType').value;
    const phone = document.getElementById('editPhone')?.value?.trim() || '';
    const workCategory = document.getElementById('editWorkCategory')?.value || '';

    const { error: upsertErr } = await client.from('profiles').upsert(
        {
            id: user.id,
            display_name: name,
            tag: tagValue,
            location,
            business_type: businessType,
            phone,
            work_category: workCategory
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
            showToast(error.message || 'Login failed', 'alert-circle');
            return;
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
    lucide.createIcons();
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

    if (loginBtn) loginBtn.style.display = likelyLoggedIn ? 'none' : 'inline-flex';
    if (notificationsBtn) notificationsBtn.style.display = loggedIn ? '' : 'none';
    if (messagesBtn) messagesBtn.style.display = loggedIn ? '' : 'none';
    if (addListingBtn) addListingBtn.style.display = loggedIn ? '' : 'none';
    if (freeVerifiedPill) freeVerifiedPill.style.display = profileReady && !verified ? '' : 'none';
    if (profileMenu) profileMenu.style.display = loggedIn ? '' : 'none';
}

function updateProfileUI() {
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
    const workText = userProfile.workCategory ? String(userProfile.workCategory) : '—';
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
    if (workEl) workEl.value = userProfile.workCategory || '';
    updateFreeVerifiedCounterUI();
    renderVerifiedQuestCard();
    updateUpgradeOfferVisibility();
    updateFreeVerifiedPrimaryAction();
    updateAdminDashboardButtonVisibility();
    updateNavbarAuthUI();
    lucide.createIcons();
    refreshMyProfileFollowCounts();
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
    lucide.createIcons();
}

function updateUpgradeOfferVisibility() {
    const vip = !!userProfile?.isVip;
    const verified = !!userProfile?.verified;
    const showFreeVerified = isLoggedIn() && hasLoadedSupabaseProfile && !verified;
    const profileReady = isLoggedIn() && hasLoadedSupabaseProfile;
    const likelyLoggedIn = isLoggedIn() || hasSupabaseAuthTokenLikely();

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
    const emailOk = String(currentSupabaseUserEmail || '').toLowerCase() === 'contactkazmy@gmail.com';
    const allowed = !!userProfile?.isAdmin || emailOk;
    btn.style.display = allowed ? '' : 'none';
}

function showVerifiedPopup(event) {
    event.stopPropagation();
    openModal('verifiedSellerModal');
    lucide.createIcons();
}

function showVipPopup(event) {
    event.stopPropagation();
    openModal('vipBadgeModal');
    lucide.createIcons();
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

function handleSearch(inputId = 'mainSearchInput') {
    const input = document.getElementById(inputId) || document.getElementById('mainSearchInput');
    const searchTerm = (input?.value || '').toLowerCase().trim();
    currentFilters.search = searchTerm;
    applyFilters();
    scheduleProfileSearch(searchTerm);
    const mainInput = document.getElementById('mainSearchInput');
    const mobileExpandInput = document.getElementById('mobileSearchExpandInput');
    if (mainInput && inputId !== 'mainSearchInput') mainInput.value = searchTerm;
    if (mobileExpandInput && inputId !== 'mobileSearchExpandInput') mobileExpandInput.value = searchTerm;
    if (searchTerm && !searchHistory.includes(searchTerm)) {
        searchHistory.unshift(searchTerm);
        if (searchHistory.length > 5) searchHistory.pop();
        localStorage.setItem('winjaySearchHistory', JSON.stringify(searchHistory));
    }
}

let profileSearchTimer = null;
let lastProfileSearchTerm = '';

function scheduleProfileSearch(term) {
    clearTimeout(profileSearchTimer);
    profileSearchTimer = setTimeout(() => {
        fetchProfileSearchResults(term);
    }, 220);
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
                const pic =
                    p.avatar_url ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(p.id || p.tag || 'user'))}`;
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
    lucide.createIcons();
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
        lucide.createIcons();
    }
}

function selectSearchTerm(term) {
    document.getElementById('mainSearchInput').value = term;
    const mobileExpand = document.getElementById('mobileSearchExpandInput');
    if (mobileExpand) mobileExpand.value = term;
    document.getElementById('searchHistoryDropdown').classList.remove('active');
    document.getElementById('mobileSearchHistoryDropdown')?.classList.remove('active');
    handleSearch();
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
    client.auth.signInWithOAuth({
        provider: 'google'
    }).then(({ error }) => {
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

function createMyListingCardHTML(item) {
    const isFavorite = favorites.includes(item.id);
    const pulse = pendingHeartPulses.has(item.id) && isFavorite;
    return `
        <div class="card my-listing-card" onclick="openListingDetail(${item.id})">
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
            <img src="${item.image}" alt="${item.title}" class="card-img">
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

function openEditListingModal(event, id) {
    event.stopPropagation();
    editingListingId = id;
    const item = listings.find(l => l.id === id);
    if (!item) return;
    const catSelect = document.getElementById('editListingCategory');
    const wilayaSelect = document.getElementById('editListingWilaya');
    if (catSelect.options.length <= 1) {
        categories.forEach(cat => {
            if (cat.special !== 'other') {
                const option = document.createElement('option');
                option.value = cat.name;
                option.textContent = cat.name;
                catSelect.appendChild(option);
            }
        });
    }
    if (wilayaSelect.options.length <= 1) {
        wilayas.forEach(wilaya => {
            const option = document.createElement('option');
            option.value = wilaya;
            option.textContent = wilaya;
            wilayaSelect.appendChild(option);
        });
    }
    document.getElementById('editListingTitle').value = item.title;
    const descEl = document.getElementById('editListingDescription');
    if (descEl) descEl.value = item.description || '';
    const conditionEl = document.getElementById('editListingCondition');
    if (conditionEl) conditionEl.value = item.condition || '';
    const priceTypeEl = document.getElementById('editListingPriceType');
    if (priceTypeEl) priceTypeEl.value = item.price_type || '';
    document.getElementById('editListingPrice').value = item.price;
    document.getElementById('editListingCategory').value = item.category;
    const subSelect = document.getElementById('editListingSubcategory');
    populateListingSubcategorySelect(subSelect, item.category, item.subcategory || '');
    document.getElementById('editListingWilaya').value = item.wilaya || '';
    const cityEl = document.getElementById('editListingCity');
    populateCitySelect(cityEl, item.wilaya || '', item.city || '');
    const deliveryEl = document.getElementById('editListingDelivery');
    if (deliveryEl) deliveryEl.value = item.delivery || '';
    const phoneEl = document.getElementById('editListingContactPhone');
    if (phoneEl) phoneEl.value = item.contact_phone || '';
    const availEl = document.getElementById('editListingAvailability');
    if (availEl) availEl.value = item.availability || 'Available';
    const tagsEl = document.getElementById('editListingTags');
    if (tagsEl) tagsEl.value = Array.isArray(item.tags) ? item.tags.join(', ') : '';
    openModal('editListingModal');
    try {
        setupSelectPickers();
    } catch (e) {
        null;
    }
    lucide.createIcons();
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
            await client.from('listing_images').delete().eq('listing_id', id);
            const { error } = await client
                .from('listings')
                .delete()
                .eq('id', id)
                .eq('owner_id', currentSupabaseUserId);
            if (error) {
                showToast(error.message || 'Failed to delete listing', 'alert-circle');
                return;
            }
            favorites = favorites.filter(fid => fid !== id);
            showToast('Listing deleted', 'trash-2');
            await fetchListingsFromSupabase({ silent: true });
            renderFavorites();
        },
        true
    );
}

function renderMyListings() {
    myListingsGrid.innerHTML = myListings.length > 0 ?
        myListings.map(item => createMyListingCardHTML(item)).join('') :
        '<div class="empty-state"><i data-lucide="shopping-bag"></i><h3>Pas encore d\'annonces</h3><p>Publiez votre première annonce !</p></div>';
    lucide.createIcons();
}

function renderMyProfileReviews() {
    const list = document.getElementById('myProfileReviewsList');
    if (!list) return;
    list.innerHTML = getReviewsListHTML(userProfile.reviewsData || [], userProfile.name, false, 'profile', userProfile.tag);
    lucide.createIcons();
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
    const listingsPanel = document.getElementById('myProfileListingsSection');
    const reviewsPanel = document.getElementById('myProfileReviewsSection');
    if (!listingsTab || !reviewsTab || !listingsPanel || !reviewsPanel) return;

    const showListings = section !== 'reviews';
    listingsTab.classList.toggle('active', showListings);
    reviewsTab.classList.toggle('active', !showListings);
    listingsPanel.classList.toggle('active', showListings);
    reviewsPanel.classList.toggle('active', !showListings);

    if (!showListings) {
        const list = document.getElementById('myProfileReviewsList');
        if (list && !myProfileReviewsLoaded) {
            list.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);"><i data-lucide="loader" style="width: 36px; height: 36px;"></i><p style="margin-top: 10px;">Loading reviews...</p></div>`;
            lucide.createIcons();
        }
        const ok = await ensureMyProfileReviewsLoaded();
        if (!ok) {
            showToast('Failed to load profile reviews', 'alert-circle');
            return;
        }
        renderMyProfileReviews();
    }
}

let adminActiveTab = 'overview';

function adminBadge(status) {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') return `<span class="admin-badge ok">APPROVED</span>`;
    if (s === 'rejected') return `<span class="admin-badge no">REJECTED</span>`;
    if (s === 'pending') return `<span class="admin-badge pending">PENDING</span>`;
    return `<span class="admin-badge">${escapeHtml(status || '—')}</span>`;
}

function isAdminAuthorized() {
    const emailOk = String(currentSupabaseUserEmail || '').toLowerCase() === 'contactkazmy@gmail.com';
    return !!(userProfile && userProfile.isAdmin) || emailOk;
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
        ['submissions', 'adminTabSubmissions', 'adminPanelSubmissions'],
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

async function renderAdminKpis() {
    const el = document.getElementById('adminKpis');
    if (!el) return;
    if (!isAdminAuthorized()) {
        el.innerHTML = '';
        return;
    }
    const users = await adminCount('profiles');
    const listingsCount = await adminCount('listings');
    const vipPending = await adminCount('vip_applications', (q) => q.eq('status', 'pending'));
    const verifiedPending = await adminCount('verified_applications', (q) => q.eq('status', 'pending'));
    const identityPending = await adminCount('identity_applications', (q) => q.eq('status', 'pending'));
    const submissionsPending = await adminCount('submissions', (q) => q.eq('status', 'pending'));
    const items = [
        { icon: 'users', label: 'Users', value: users.error ? '—' : users.count },
        { icon: 'layout-grid', label: 'Listings', value: listingsCount.error ? '—' : listingsCount.count },
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
                <div class="kpi-value">${escapeHtml(String(x.value))}</div>
            </div>
        `
        )
        .join('');
    lucide.createIcons();
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
    const title = `winjay.dz - Users Export`;
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
    const { error } = await client.from('profiles').update({ is_vip: !!next }).eq('id', String(userId));
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
    const { error } = await client.from('profiles').update({ verified: !!next }).eq('id', String(userId));
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
    const now = new Date().toISOString();
    const { error: appErr } = await client
        .from('vip_applications')
        .update({ status: 'approved', decided_by: currentSupabaseUserId, decided_at: now })
        .eq('id', String(appId));
    if (appErr) {
        showToast(appErr.message || 'Failed', 'alert-circle');
        return;
    }
    const { error: profErr } = await client.from('profiles').update({ is_vip: true }).eq('id', String(userId));
    if (profErr) {
        showToast(profErr.message || 'Failed', 'alert-circle');
        return;
    }
    client.from('admin_audit_log').insert({ admin_id: currentSupabaseUserId, action: 'vip_approved', target_user_id: userId, meta: { app_id: appId } });
    showToast('VIP approved', 'check-circle');
    renderVipApplications();
    renderAdminKpis();
}

async function adminRejectVip(appId) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const now = new Date().toISOString();
    const { error } = await client
        .from('vip_applications')
        .update({ status: 'rejected', decided_by: currentSupabaseUserId, decided_at: now })
        .eq('id', String(appId));
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    client.from('admin_audit_log').insert({ admin_id: currentSupabaseUserId, action: 'vip_rejected', target_user_id: null, meta: { app_id: appId } });
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
    const now = new Date().toISOString();
    const { error: appErr } = await client
        .from('verified_applications')
        .update({ status: 'approved', decided_by: currentSupabaseUserId, decided_at: now })
        .eq('id', String(appId));
    if (appErr) {
        showToast(appErr.message || 'Failed', 'alert-circle');
        return;
    }
    const { error: profErr } = await client.from('profiles').update({ verified: true }).eq('id', String(userId));
    if (profErr) {
        showToast(profErr.message || 'Failed', 'alert-circle');
        return;
    }
    client.from('admin_audit_log').insert({ admin_id: currentSupabaseUserId, action: 'verified_approved', target_user_id: userId, meta: { app_id: appId } });
    showToast('Verified approved', 'check-circle');
    renderVerifiedApplications();
    renderAdminKpis();
}

async function adminRejectVerified(appId) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const now = new Date().toISOString();
    const { error } = await client
        .from('verified_applications')
        .update({ status: 'rejected', decided_by: currentSupabaseUserId, decided_at: now })
        .eq('id', String(appId));
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    client.from('admin_audit_log').insert({ admin_id: currentSupabaseUserId, action: 'verified_rejected', target_user_id: null, meta: { app_id: appId } });
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
    lucide.createIcons();

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
        lucide.createIcons();
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
    const now = new Date().toISOString();
    const { error: appErr } = await client
        .from('identity_applications')
        .update({ status: 'approved', decided_by: currentSupabaseUserId, decided_at: now })
        .eq('id', String(appId));
    if (appErr) {
        showToast(appErr.message || 'Failed', 'alert-circle');
        return;
    }
    await createNotificationFromClient({ recipientId: userId, type: 'identity_approved', meta: { app_id: appId } });

    let grantedVerified = false;
    let eligibility = { eligible: false };
    try {
        const profRes = await client
            .from('profiles')
            .select('display_name, tag, phone, work_category')
            .eq('id', String(userId))
            .maybeSingle();
        const prof = profRes?.data || {};
        const hasBasics = !!String(prof.display_name || '').trim() && !!String(prof.tag || '').trim();
        const hasPhone = !!String(prof.phone || '').trim();
        const hasWork = !!String(prof.work_category || '').trim();
        let refs = 0;
        const refsRes = await client
            .from('referrals')
            .select('id', { count: 'exact', head: true })
            .eq('referrer_id', String(userId));
        if (!refsRes.error) refs = Number(refsRes.count) || 0;
        const hasRefs = refs >= REFERRALS_REQUIRED;
        eligibility = { eligible: hasBasics && hasPhone && hasWork && hasRefs, refs, hasBasics, hasPhone, hasWork, hasRefs };
        if (eligibility.eligible) {
            const { error: profErr } = await client.from('profiles').update({ verified: true }).eq('id', String(userId));
            if (!profErr) {
                grantedVerified = true;
                await createNotificationFromClient({ recipientId: userId, type: 'verified_granted', meta: { source: 'free_verified_quest' } });
            }
        }
    } catch (e) {
        eligibility = { eligible: false, error: String(e?.message || e || '') };
    }

    client
        .from('admin_audit_log')
        .insert({ admin_id: currentSupabaseUserId, action: 'identity_approved', target_user_id: userId, meta: { app_id: appId, granted_verified: grantedVerified, eligibility } });
    showToast(grantedVerified ? 'Approved + Verified granted' : 'Approved', 'check-circle');
    renderIdentityApplications();
    renderAdminKpis();
}

async function adminRejectIdentity(appId, userId) {
    if (!isAdminAuthorized()) return;
    const client = initSupabase();
    if (!client) return;
    const now = new Date().toISOString();
    const { error } = await client
        .from('identity_applications')
        .update({ status: 'rejected', decided_by: currentSupabaseUserId, decided_at: now })
        .eq('id', String(appId));
    if (error) {
        showToast(error.message || 'Failed', 'alert-circle');
        return;
    }
    await createNotificationFromClient({ recipientId: userId, type: 'identity_rejected', meta: { app_id: appId } });
    client.from('admin_audit_log').insert({ admin_id: currentSupabaseUserId, action: 'identity_rejected', target_user_id: userId, meta: { app_id: appId } });
    showToast('Rejected', 'check-circle');
    renderIdentityApplications();
    renderAdminKpis();
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
    const ids = (data || []).map((x) => x.user_id).filter(Boolean);
    const profiles = await fetchProfilesForAdmin(ids);
    tbody.innerHTML = (data || [])
        .map((s) => {
            const p = s.user_id ? profiles[s.user_id] || {} : {};
            const userLabel = s.user_id ? `${escapeHtml(p.display_name || 'User')} ${p.tag ? `<span class="muted">${escapeHtml(p.tag)}</span>` : ''}` : '<span class="muted">Guest</span>';
            const details = escapeHtml(JSON.stringify(s.payload || {}, null, 0)).slice(0, 160);
            return `
                <tr>
                    <td>${escapeHtml(s.type || '')}</td>
                    <td>${userLabel}</td>
                    <td>${escapeHtml(formatAdminDate(s.created_at))}</td>
                    <td>${adminBadge(s.status)}</td>
                    <td>${details}</td>
                </tr>
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

function renderAdminLiveVisitors() {
    if (!isAdminAuthorized()) return;
    const el = document.getElementById('adminLiveList');
    if (!el) return;
    if (!livePresenceChannel) {
        el.innerHTML = '<div class="muted">Realtime not connected.</div>';
        return;
    }
    const state = livePresenceChannel.presenceState?.() || {};
    const entries = flattenPresenceState(state).sort((a, b) => String(b.last_seen || '').localeCompare(String(a.last_seen || '')));
    if (!entries.length) {
        el.innerHTML = '<div class="muted">No active visitors.</div>';
        return;
    }
    el.innerHTML = entries
        .slice(0, 80)
        .map((v) => {
            const id = v.user_id ? String(v.user_id).slice(0, 8) : String(v.key || '').slice(0, 8);
            const label = v.user_id ? `user:${escapeHtml(id)}` : `anon:${escapeHtml(id)}`;
            const section = escapeHtml(v.section || '');
            const seen = escapeHtml(formatAdminDate(v.last_seen));
            return `
                <div class="admin-list-item">
                    <div>
                        <div style="font-weight:800;">${label}</div>
                        <div class="meta">${section}</div>
                    </div>
                    <div class="meta">${seen}</div>
                </div>
            `;
        })
        .join('');
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

async function renderAdminDashboard(force = false) {
    if (!isAdminAuthorized()) {
        showSection('home-section');
        return;
    }
    if (!adminActiveTab) adminActiveTab = 'overview';
    setActiveAdminTab(adminActiveTab);
    await renderAdminKpis();
    if (adminActiveTab === 'overview') await renderAdminOverviewLists();
    if (adminActiveTab === 'users') await renderAdminUsers();
    if (adminActiveTab === 'vip') await renderVipApplications();
    if (adminActiveTab === 'verified') {
        await renderVerifiedApplications();
        await renderIdentityApplications();
    }
    if (adminActiveTab === 'submissions') await renderSubmissions();
    if (adminActiveTab === 'live') renderAdminLiveVisitors();
    if (force) showToast('Updated', 'check-circle');
}

function showSection(sectionId) {
    if (sectionId === 'profile-section' && !isLoggedIn()) {
        setPendingSectionAfterAuth('profile-section');
        openModal('authGateModal');
        lucide.createIcons();
        return;
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
    try {
        document.activeElement?.blur?.();
    } catch {}
    closeMobileSearchExpand();
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    if (window.innerWidth <= 768) {
        setSidebarMobileOpen(false);
    }
    const lockChatScroll = sectionId === 'messages-section' && window.innerWidth <= 900;
    window.scrollTo({ top: 0, behavior: lockChatScroll ? 'auto' : 'smooth' });
    syncMessagesScrollLock();

    // Save current section to localStorage
    if (sectionId !== 'listing-detail-section' && sectionId !== 'create-listing-section') {
        localStorage.setItem('winjayLastSection', sectionId);
    }
    updateLivePresence();

    if (sectionId === 'home-section') {
        clearSellerProfileRouteTag();
        renderListings();
    } else if (sectionId === 'favorites-section') {
        clearSellerProfileRouteTag();
        renderFavorites();
    } else if (sectionId === 'profile-section') {
        clearSellerProfileRouteTag();
        renderMyListings();
        renderMyProfileReviews();
    } else if (sectionId === 'messages-section') {
        clearSellerProfileRouteTag();
        if (suppressNextMessagesBootstrap) {
            suppressNextMessagesBootstrap = false;
            renderMessagesList();
            renderEmptyChat();
        } else {
            bootstrapMessages();
        }
        scheduleSyncMessagesContainerHeight();
    } else if (sectionId === 'admin-dashboard-section') {
        clearSellerProfileRouteTag();
        renderAdminDashboard();
    }
}

function getActiveSectionId() {
    const active = document.querySelector('.content-section.active');
    return active?.id || 'home-section';
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

function navigateBackFromSellerProfileFlow() {
    const state = history.state && typeof history.state === 'object' ? history.state : null;
    const from = state?.from ? String(state.from) : '';
    const fromListingId = Number(state?.fromListingId) || 0;
    if (history.length > 1) {
        history.back();
        return;
    }
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
    const last = (localStorage.getItem('winjayLastSection') || '').trim() || 'home-section';
    showSection(last === 'listing-detail-section' || last === 'create-listing-section' ? 'home-section' : last);
}

function navigateBackFromListingFlow() {
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
    lucide.createIcons();
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
    try {
        renderListingImagesSlots();
    } catch (e) {
        null;
    }
    const phoneInput = document.getElementById('listingContactPhone');
    if (phoneInput && !phoneInput.value && userProfile?.phone) {
        phoneInput.value = userProfile.phone;
    }
    try {
        setupSelectPickers();
    } catch (e) {
        null;
    }
    lucide.createIcons();
}

function handleListingRoutesFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const profileParam = params.get('profile');
    if (profileParam) {
        const tag = profileParam.startsWith('@') ? profileParam : '@' + profileParam;
        showSection('seller-profile-section');
        const content = document.getElementById('externalProfileContent');
        if (content) {
            content.innerHTML = getSellerProfileSkeletonHTML();
        }
        openSellerProfile(tag.toLowerCase(), 'listings', { pushState: false });
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
    const lastSectionRaw = localStorage.getItem('winjayLastSection') || 'home-section';
    const blocked = ['profile-section', 'messages-section', 'favorites-section', 'settings-section', 'admin-dashboard-section'];
    const safeLast =
        lastSectionRaw === 'listing-detail-section' || lastSectionRaw === 'create-listing-section'
            ? 'home-section'
            : lastSectionRaw;
    const lastSection = (blocked.includes(safeLast) && !isLoggedIn()) ? 'home-section' : safeLast;
    showSection(lastSection);
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
    document.querySelectorAll('.category-list li a, .sidebar-section li a').forEach(a => a.classList.remove('active'));
    if (element) element.classList.add('active');
    document.getElementById('filterCategory').value = currentFilters.category;
    applyFilters();
}

function toggleFilterPanel() {
    document.getElementById('filterPanel').classList.toggle('active');
}

function applyFilters() {
    currentFilters.wilaya = document.getElementById('filterWilaya').value;
    currentFilters.category = document.getElementById('filterCategory').value;
    currentFilters.priceMin = document.getElementById('priceMin').value;
    currentFilters.priceMax = document.getElementById('priceMax').value;
    currentFilters.sort = document.getElementById('sortSelect').value;
    updateActiveFilters();
    currentPage = 1;
    renderListings();
}

function clearFilters() {
    currentFilters = { search: '', category: '', wilaya: '', priceMin: '', priceMax: '', sort: 'newest' };
    document.getElementById('mainSearchInput').value = '';
    document.getElementById('filterWilaya').value = '';
    document.getElementById('filterCategory').value = '';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    document.getElementById('sortSelect').value = 'newest';
    document.getElementById('filterPanel').classList.remove('active');
    updateActiveFilters();
    currentPage = 1;
    renderListings();
}

function updateActiveFilters() {
    const container = document.getElementById('activeFilters');
    let tags = [];
    if (currentFilters.category) tags.push(`<span class="filter-tag">${currentFilters.category} <button onclick="removeFilter('category')">&times;</button></span>`);
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
        document.getElementById('filterCategory').value = '';
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
    currentPage = 1;
    renderListings();
}

function clearAllFilters() {
    currentFilters = { search: '', category: '', wilaya: '', priceMin: '', priceMax: '', sort: 'newest' };
    document.getElementById('filterCategory').value = '';
    document.getElementById('filterWilaya').value = '';
    document.getElementById('priceMin').value = '';
    document.getElementById('priceMax').value = '';
    document.getElementById('sortSelect').value = 'newest';
    document.getElementById('mainSearchInput').value = '';
    updateActiveFilters();
    currentPage = 1;
    renderListings();
    showToast('Filtres effacés', 'filter');
}

function handleSort() {
    currentFilters.sort = document.getElementById('sortSelect').value;
    currentPage = 1;
    renderListings();
}

function getFilteredListings() {
    let filtered = [...listings];
    if (currentFilters.search) {
        filtered = filtered.filter(l => l.title.toLowerCase().includes(currentFilters.search) || l.category.toLowerCase().includes(currentFilters.search));
    }
    if (currentFilters.category) {
        filtered = filtered.filter(l => l.category === currentFilters.category);
    }
    if (currentFilters.wilaya) {
        filtered = filtered.filter(l => l.location === currentFilters.wilaya);
    }
    if (currentFilters.priceMin) {
        filtered = filtered.filter(l => l.price >= parseInt(currentFilters.priceMin));
    }
    if (currentFilters.priceMax) {
        filtered = filtered.filter(l => l.price <= parseInt(currentFilters.priceMax));
    }
    if (currentFilters.sort === 'price-asc') {
        filtered.sort((a, b) => a.price - b.price);
    } else if (currentFilters.sort === 'price-desc') {
        filtered.sort((a, b) => b.price - a.price);
    }
    return filtered;
}

function goToPage(page) {
    currentPage = page;
    renderListings();
    const grid = document.getElementById('listingsGrid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderPagination(totalPages) {
    if (!pagination) return;
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    const clamped = Math.max(1, Math.min(currentPage, totalPages));
    currentPage = clamped;

    const windowSize = Math.min(MAX_PAGE_BUTTONS, totalPages);
    let start = Math.max(1, currentPage - Math.floor(windowSize / 2));
    let end = start + windowSize - 1;
    if (end > totalPages) {
        end = totalPages;
        start = Math.max(1, end - windowSize + 1);
    }

    let html = '';
    html += `<button class="page-btn nav" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})"><i data-lucide="chevron-left"></i></button>`;
    for (let p = start; p <= end; p++) {
        html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goToPage(${p})">${p}</button>`;
    }
    html += `<button class="page-btn nav" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})"><i data-lucide="chevron-right"></i></button>`;

    pagination.innerHTML = html;
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
                                <div class="skeleton-block" style="height: 56px; width: min(520px, 100%);"></div>
                            </div>
                            <div class="profile-skeleton-actions">
                                <div class="skeleton-block"></div>
                                <div class="skeleton-block"></div>
                            </div>
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

function renderListings() {
    const filtered = getFilteredListings();
    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    if (totalPages > 0 && currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(start, start + ITEMS_PER_PAGE);

    listingsGrid.innerHTML = totalItems > 0 ?
        pageItems.map(item => createCardHTML(item)).join('') :
        '';
    document.getElementById('emptyState').style.display = totalItems === 0 ? 'block' : 'none';
    document.getElementById('listingsGrid').style.display = totalItems === 0 ? 'none' : 'grid';
    renderPagination(totalPages);
    lucide.createIcons();
}

function renderFavorites() {
    const favoriteListings = listings.filter(l => favorites.includes(l.id));
    const grid = document.getElementById('favoritesGrid');
    grid.innerHTML = favoriteListings.length > 0 ?
        favoriteListings.map(item => createCardHTML(item)).join('') :
        '';
    document.getElementById('favoritesEmpty').style.display = favoriteListings.length === 0 ? 'block' : 'none';
    lucide.createIcons();
}

function createCardHTML(item) {
    const isFavorite = favorites.includes(item.id);
    const pulse = pendingHeartPulses.has(item.id) && isFavorite;
    const availability = String(item.availability || '').toLowerCase();
    const badgeText = availability === 'sold' ? 'Sold' : (availability === 'reserved' ? 'Reserved' : '');
    return `
        <div class="card" onclick="openListingDetail(${item.id})">
            <button class="favorite-btn ${isFavorite ? 'active' : ''} ${pulse ? 'pulse' : ''}" onclick="toggleFavorite(event, ${item.id})">
                <i data-lucide="heart"></i>
            </button>
            ${badgeText ? `<div class="card-status-badge ${availability}">${badgeText}</div>` : ''}
            <img src="${item.image}" alt="${item.title}" class="card-img">
            <div class="card-content">
                <div class="card-price">${(item.price_type === 'Free' || Number(item.price) === 0) ? 'Free' : `${new Intl.NumberFormat('fr-DZ').format(item.price)} DZD`}</div>
                <div class="card-title">${item.title}</div>
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

function getRatingHTML(rating, reviews) {
    const reviewCount = Number(reviews) || 0;
    const safeRating = Number(rating) || 0;
    if (reviewCount <= 0 || safeRating <= 0) return '';
    const fullStars = Math.floor(safeRating);
    let starsHTML = '';
    for (let i = 0; i < 5; i++) {
        starsHTML += `<i data-lucide="star" style="${i < fullStars ? 'fill: #ffb400;' : ''} width: 14px; height: 14px;"></i>`;
    }
    return `<div class="rating-container"><div class="stars">${starsHTML}</div><span class="rating-value">${safeRating}</span><span class="reviews-count">(${reviewCount} avis)</span></div>`;
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

function toggleReplyBox(contextType, targetId, index) {
    const { boxId, inputId } = getReplyElementIds(contextType, targetId, index);
    const box = document.getElementById(boxId);
    const input = document.getElementById(inputId);
    if (!box || !input) return;
    const record = getReviewRecord(contextType, targetId, index);
    if (!record) return;
    if (record.reply && record.replyAuthorTag !== userProfile.tag) return;
    const show = box.style.display !== 'block';
    box.style.display = show ? 'block' : 'none';
    if (show) input.focus();
}

async function saveReplyToReview(contextType, targetId, index) {
    const { inputId } = getReplyElementIds(contextType, targetId, index);
    const input = document.getElementById(inputId);
    if (!input) return;
    const reply = input.value.trim();
    if (!reply) {
        showToast('Ajoutez une réponse.', 'alert-circle');
        return;
    }

    const record = getReviewRecord(contextType, targetId, index);
    if (!record) return;
    if (record.reply && record.replyAuthorTag !== userProfile.tag) {
        showToast('Vous ne pouvez modifier que votre propre réponse.', 'alert-circle');
        return;
    }

    if (contextType === 'profile') {
        if (DEMO_MODE) {
            record.reply = escapeHtml(reply);
            record.replyAuthorTag = userProfile.tag;
            const profile = findProfileByTag(targetId);
            if (profile) recalculateProfileRating(profile);
            if (targetId === userProfile.tag) {
                updateProfileUI();
                renderMyProfileReviews();
                switchMyProfileSection('reviews');
            } else {
                openSellerProfile(targetId, 'reviews');
            }
            showToast('Réponse enregistrée.', 'check-circle');
            return;
        }
        if (!requireAuthOrPrompt()) return;
        if (!currentSupabaseUserId) return;
        if (targetId !== userProfile.tag) {
            showToast('Vous ne pouvez répondre que sur votre propre profil.', 'alert-circle');
            return;
        }
        const client = initSupabase();
        if (!client) return;
        const reviewId = String(record?.id || '').trim();
        if (!reviewId) {
            showToast('Review not found', 'alert-circle');
            return;
        }
        const updatePayload = { reply: escapeHtml(reply), reply_author_id: currentSupabaseUserId, reply_created_at: new Date().toISOString() };
        const { error } = await client.from('profile_reviews').update(updatePayload).eq('id', reviewId);
        if (error) {
            showToast(error.message || 'Failed to save reply', 'alert-circle');
            return;
        }
        if (record?.authorId) {
            await createNotificationFromClient({
                recipientId: record.authorId,
                type: 'profile_review_reply',
                targetProfileId: currentSupabaseUserId,
                meta: { reviewId }
            });
        }
        userProfile.reviewsData = await fetchProfileReviews(currentSupabaseUserId);
        updateProfileUI();
        renderMyProfileReviews();
        switchMyProfileSection('reviews');
        showToast('Réponse enregistrée.', 'check-circle');
        return;
    }

    if (contextType === 'listing') {
        const listingId = Number(targetId);
        if (DEMO_MODE) {
            record.reply = escapeHtml(reply);
            record.replyAuthorTag = userProfile.tag;
            listingReviewPanelState[listingId] = true;
            openListingDetail(listingId);
            showToast('Réponse enregistrée.', 'check-circle');
            return;
        }
        if (!requireAuthOrPrompt()) return;
        if (!currentSupabaseUserId) return;
        const listing = listings.find((l) => l.id === listingId);
        if (!listing?.owner_id || String(listing.owner_id) !== String(currentSupabaseUserId)) {
            showToast('Vous ne pouvez répondre que sur vos propres annonces.', 'alert-circle');
            return;
        }
        const client = initSupabase();
        if (!client) return;
        const reviewId = String(record?.id || '').trim();
        if (!reviewId) {
            showToast('Review not found', 'alert-circle');
            return;
        }
        const updatePayload = { reply: escapeHtml(reply), reply_author_id: currentSupabaseUserId, reply_created_at: new Date().toISOString() };
        const { error } = await client.from('listing_reviews').update(updatePayload).eq('id', reviewId);
        if (error) {
            showToast(error.message || 'Failed to save reply', 'alert-circle');
            return;
        }
        if (record?.authorId) {
            await createNotificationFromClient({
                recipientId: record.authorId,
                type: 'listing_review_reply',
                listingId: listingId,
                meta: { reviewId }
            });
        }
        listingReviewPanelState[listingId] = true;
        await refreshListingReviewsForListingDetail(listingId, listing?.seller?.name || 'Vendeur');
        openListingDetail(listingId);
        showToast('Réponse enregistrée.', 'check-circle');
    }
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

async function addProfileReview(targetTag, source = 'seller-profile') {
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

    if (DEMO_MODE) {
        if (String(targetTag || '').toLowerCase() === String(userProfile.tag || '').toLowerCase()) {
            showToast('Vous ne pouvez pas noter votre propre profil.', 'alert-circle');
            return;
        }
        const profile = findProfileByTag(targetTag);
        if (!profile) return;
        const reviewer = getCurrentReviewerIdentity();
        profile.reviewsData = profile.reviewsData || [];
        profile.reviewsData.unshift({
            user: reviewer.user,
            tag: reviewer.tag,
            pic: reviewer.pic,
            rating,
            date: "À l'instant",
            comment: escapeHtml(comment),
            reply: null,
            replyAuthorTag: null,
            thread: [],
            likes: 0
        });
        recalculateProfileRating(profile);
        ratingInput.value = '5';
        commentInput.value = '';
        if (targetTag === userProfile.tag) {
            updateProfileUI();
            renderMyProfileReviews();
            switchMyProfileSection('reviews');
        } else {
            openSellerProfile(targetTag, 'reviews');
        }
        showToast('Avis ajouté avec succès !', 'check-circle');
        return;
    }

    if (!requireAuthOrPrompt()) return;
    const client = initSupabase();
    if (!client || !currentSupabaseUserId) {
        showToast('Please log in again', 'log-in');
        return;
    }
    const targetProfile = await fetchProfileByTag(targetTag);
    if (!targetProfile?.id) {
        showToast('Seller profile not found', 'alert-circle');
        return;
    }
    if (String(targetProfile.id) === String(currentSupabaseUserId)) {
        showToast('Vous ne pouvez pas noter votre propre profil.', 'alert-circle');
        return;
    }

    const targetColumn = profileReviewsTargetColumn || 'profile_id';
    let insertPayload = {
        author_id: currentSupabaseUserId,
        rating,
        comment
    };
    insertPayload[targetColumn] = targetProfile.id;

    let { error } = await client.from('profile_reviews').insert(insertPayload);
    if (error && isMissingColumnError(error, targetColumn)) {
        const fallback = targetColumn === 'profile_id' ? 'target_profile_id' : 'profile_id';
        insertPayload = {
            author_id: currentSupabaseUserId,
            rating,
            comment
        };
        insertPayload[fallback] = targetProfile.id;
        const retry = await client.from('profile_reviews').insert(insertPayload);
        error = retry.error;
        if (!error) profileReviewsTargetColumn = fallback;
    } else if (!error) {
        profileReviewsTargetColumn = targetColumn;
    }
    if (error) {
        if (isProfileReviewsBackendMissing(error)) {
            showToast('Profile reviews backend is not set up yet', 'alert-circle');
        } else {
            showToast(error.message || 'Failed to post review', 'alert-circle');
        }
        return;
    }
    await createNotificationFromClient({ recipientId: targetProfile.id, type: 'profile_review', targetProfileId: targetProfile.id, meta: { rating } });
    ratingInput.value = '5';
    commentInput.value = '';
    if (targetProfile.id === currentSupabaseUserId) {
        userProfile.reviewsData = await fetchProfileReviews(currentSupabaseUserId);
        const summary = computeRatingSummaryFromReviews(userProfile.reviewsData);
        userProfile.rating = summary.rating;
        userProfile.reviews = summary.reviews;
        updateProfileUI();
        renderMyProfileReviews();
        switchMyProfileSection('reviews');
    } else {
        await openSellerProfile(String(targetProfile.tag || targetTag).toLowerCase(), 'reviews');
    }
    showToast('Avis ajouté avec succès !', 'check-circle');
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

    const pulseBtn = () => {
        if (!btn?.classList) return;
        btn.classList.add('pulse');
        window.setTimeout(() => btn.classList.remove('pulse'), 320);
    };
    const isCardHeart = !!btn?.classList?.contains('favorite-btn');
    const isDetailHeart = !!btn?.classList?.contains('detail-like-btn');

    if (DEMO_MODE) {
        const index = favorites.indexOf(listingId);
        if (index > -1) {
            favorites.splice(index, 1);
            btn?.classList?.remove('active');
            showToast('Retiré des favoris', 'heart');
        } else {
            favorites.push(listingId);
            btn?.classList?.add('active');
            if (isDetailHeart) pulseBtn();
            showToast('Ajouté aux favoris', 'heart');
        }
        if (favorites.includes(listingId)) pendingHeartPulses.add(listingId);
        renderListings();
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
        if (isDetailHeart) pulseBtn();
        if (isCardHeart) pendingHeartPulses.add(listingId);
    }
    renderListings();
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
        renderListings();
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
    renderListings();
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

function setListingDetailImage(listingId, index) {
    listingDetailImageIndex[listingId] = index;
    const main = document.getElementById('detailMainImage');
    const urls = getListingImagesForDetail(listings.find((l) => l.id === listingId));
    const idx = Math.max(0, Math.min(urls.length - 1, Number(index) || 0));
    if (main && urls[idx]) {
        main.src = urls[idx];
        main.setAttribute('data-src', urls[idx]);
        main.onclick = () => openLightbox(urls[idx]);
    }
    document.querySelectorAll('[data-detail-thumb]').forEach((btn) => {
        const n = Number(btn.getAttribute('data-detail-thumb')) || 0;
        btn.classList.toggle('active', n === idx);
    });
}

function openListingDetail(listingId, { pushState = true } = {}) {
    const item = listings.find(l => l.id === listingId);
    if (!item) return;
    currentListingDetailId = listingId;
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
    const seller = item.seller || { name: "Utilisateur Winjay", tag: "@user", pic: "https://api.dicebear.com/7.x/avataaars/svg?seed=Winjay", verified: false, rating: 0, reviews: 0, reviewsData: [] };
    const isLiked = favorites.includes(listingId);
    const pulse = pendingHeartPulses.has(listingId) && isLiked;
    const detailImages = getListingImagesForDetail(item);
    const selectedIdxRaw = listingDetailImageIndex[listingId] ?? 0;
    const selectedIdx = Math.max(0, Math.min(detailImages.length - 1, Number(selectedIdxRaw) || 0));
    listingDetailImageIndex[listingId] = selectedIdx;
    const mainImageUrl = detailImages[selectedIdx] || item.image;
    const thumbsHtml = detailImages.length > 1
        ? `<div class="detail-thumbs">${detailImages
              .map(
                  (u, i) =>
                      `<button type="button" class="detail-thumb ${i === selectedIdx ? 'active' : ''}" data-detail-thumb="${i}" onclick="setListingDetailImage(${listingId}, ${i})"><img src="${u}" alt=""></button>`
              )
              .join('')}</div>`
        : '';
    const bestListingReview = item.reviewsData.length > 0 ? item.reviewsData[0] : null;
    const similarListings = getSimilarListings(item);
    const reviewsCount = item.reviewsData.length;
    const reviewsExpanded = !!listingReviewPanelState[listingId];
    const similarHTML = similarListings.length > 0 ? `
        <div class="similar-listings">
            <h3>Annonces similaires</h3>
            <div class="similar-grid">
                ${similarListings.map(s => `
                    <div class="card" onclick="openListingDetail(${s.id})" style="cursor: pointer;">
                        <img src="${s.image}" alt="${s.title}" class="card-img" style="height: 120px;">
                        <div class="card-content" style="padding: 10px;">
                            <div class="card-price" style="font-size: 1rem;">${new Intl.NumberFormat('fr-DZ').format(s.price)} DA</div>
                            <div class="card-title" style="font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s.title}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>` : '';
    content.innerHTML = `
        <div class="detail-container">
            <div class="detail-gallery">
                <img id="detailMainImage" src="${mainImageUrl}" data-src="${mainImageUrl}" class="detail-image" alt="${item.title}" onclick="openLightbox('${mainImageUrl}')">
                ${thumbsHtml}
            </div>
            <div class="detail-info">
                <h2>${item.title} <span class="listing-status-badge ${String(item.availability || 'Available').toLowerCase() === 'sold' ? 'sold' : (String(item.availability || 'Available').toLowerCase() === 'reserved' ? 'pending' : 'ok')}">${escapeHtml(item.availability || 'Available')}</span></h2>
                <div class="detail-price">${(item.price_type === 'Free' || Number(item.price) === 0) ? 'Free' : `${new Intl.NumberFormat('fr-DZ').format(item.price)} DZD`}</div>
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
                            <div class="kv-row">
                                <div class="kv-label">Disponibilité</div>
                                <div class="kv-value">${escapeHtml(item.availability || '—')}</div>
                            </div>
                            <div class="kv-row">
                                <div class="kv-label">État</div>
                                <div class="kv-value">${escapeHtml(item.condition || '—')}</div>
                            </div>
                            <div class="kv-row">
                                <div class="kv-label">Livraison</div>
                                <div class="kv-value">${escapeHtml(item.delivery || '—')}</div>
                            </div>
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
                                <div class="kv-value">${escapeHtml(item.contact_phone)}</div>
                            </div>
                        </div>
                    </div>` : ''}
                </div>
                ${item.description ? `<div class="detail-description"><h3>Description</h3><p>${escapeHtml(item.description)}</p></div>` : ''}
                <h3>Vendeur</h3>
                <div class="seller-card" onclick="openSellerProfileByOwnerId('${item.owner_id}')">
                    <div class="seller-info">
                        <img id="listingSellerAvatar" src="${seller.pic || seller.profilePic}" class="seller-avatar">
                        <div>
                            <div class="seller-name" id="listingSellerName">${seller.name} ${getUserBadgesHTML(seller)}</div>
                            <div class="seller-tag" id="listingSellerTag">${seller.tag}</div>
                            <div id="listingSellerRating">${getRatingHTML(seller.rating || 0, seller.reviews || 0)}</div>
                            <button class="see-reviews-btn" type="button" onclick="event.stopPropagation(); openSellerProfileByOwnerId('${item.owner_id}', 'reviews')">
                                <i data-lucide="star"></i>
                                Avis du vendeur
                            </button>
                        </div>
                    </div>
                    <i data-lucide="chevron-right"></i>
                </div>
                <div class="detail-contact-actions">
                    <button class="message-contact-btn" onclick="startChatWithSellerByOwnerId('${item.owner_id}')">
                        <i data-lucide="message-circle" style="width: 18px; height: 18px;"></i>
                        Message
                    </button>
                    ${item.contact_phone ? `<a class="call-contact-btn" href="tel:${String(item.contact_phone).replace(/[^0-9+]/g, '')}" onclick="event.stopPropagation();"><i data-lucide="phone-call" style="width: 18px; height: 18px;"></i> Appeler</a>` : ''}
                </div>
                ${item.contact_phone ? `<div class="detail-phone"><i data-lucide="phone"></i> ${escapeHtml(item.contact_phone)}</div>` : ''}
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
    lucide.createIcons();
    refreshListingReviewsForListingDetail(listingId, seller?.name || 'Vendeur');
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
            sellerRatingEl.innerHTML = getRatingHTML(summary.rating, summary.reviews);
            lucide.createIcons();
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
    lucide.createIcons();
}

function shareListing(platform, id) {
    const item = listings.find(l => l.id === id);
    if (!item) return;
    const url = window.location.href;
    const text = `Regardez cette annonce sur Winjay.dz : ${item.title}`;
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
    const text = `Check my profile on winjay.dz: ${userProfile.name} (${tag})`;
    try {
        if (navigator.share) {
            await navigator.share({ title: 'winjay.dz', text, url });
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
    const text = `Check this profile on winjay.dz: ${label} (${safeTag})`;
    let shared = false;
    try {
        if (navigator.share) {
            await navigator.share({ title: 'winjay.dz', text, url });
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
    lucide.createIcons();
    return rows;
}

async function switchSellerProfileSection(section = 'listings') {
    const listingsTab = document.getElementById('sellerListingsTab');
    const reviewsTab = document.getElementById('sellerReviewsTab');
    const listingsPanel = document.getElementById('sellerListingsSection');
    const reviewsPanel = document.getElementById('sellerReviewsSection');
    if (!listingsTab || !reviewsTab || !listingsPanel || !reviewsPanel) return;

    const showListings = section !== 'reviews';
    listingsTab.classList.toggle('active', showListings);
    reviewsTab.classList.toggle('active', !showListings);
    listingsPanel.classList.toggle('active', showListings);
    reviewsPanel.classList.toggle('active', !showListings);
    if (!showListings && currentSellerProfileOwnerId) {
        const listEl = document.getElementById('sellerProfileReviewsList');
        if (listEl && !sellerProfileReviewsCache.has(String(currentSellerProfileOwnerId))) {
            listEl.innerHTML = `<div style="padding: 20px; text-align: center; color: var(--text-muted);"><i data-lucide="loader" style="width: 36px; height: 36px;"></i><p style="margin-top: 10px;">Loading reviews...</p></div>`;
            lucide.createIcons();
        }
        try {
            await ensureSellerProfileReviewsLoaded(currentSellerProfileOwnerId);
        } catch (e) {
            showToast('Failed to load profile reviews', 'alert-circle');
        }
    }
}

function mapProfileRowToSeller(row) {
    const id = row?.id || '';
    const pic =
        pickFirstValue(row, ['avatar_url', 'profile_pic', 'profilePic', 'picture', 'photo_url']) ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(String(id || 'user'))}`;
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
    const from = getActiveSectionId();
    const fromListingId = from === 'listing-detail-section' ? currentListingDetailId : null;
    const content = document.getElementById('externalProfileContent');
    if (content) content.innerHTML = getSellerProfileSkeletonHTML();
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
                <button class="profile-switch-btn" id="sellerReviewsTab" type="button" onclick="switchSellerProfileSection('reviews')">
                    <i data-lucide="star"></i>
                    <span>Reviews</span>
                </button>
            </div>
            <div id="sellerListingsSection" class="profile-section-panel active">
                ${sellerListings.length > 0 ? `<h3>Listings from ${seller.name}</h3><div class="listings-grid">${sellerListings.map(l => createCardHTML(l)).join('')}</div>` : '<div style="text-align: center; padding: 40px; color: var(--text-muted);"><i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin-bottom: 15px; opacity: 0.5;"></i><p>No listings yet.</p></div>'}
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
    switchSellerProfileSection(section);
    initSellerProfileFollowUI(ownerId);
    fetchProfileRatingSummary(profileRow.id).then((summary) => {
        if (String(currentSellerProfileOwnerId || '') !== String(profileRow.id || '')) return;
        profileRatingSummaryCache.set(String(profileRow.id), summary);
        const el = document.getElementById('sellerProfileRatingContainer');
        if (el) el.innerHTML = getRatingHTML(summary.rating, summary.reviews);
        lucide.createIcons();
    });
    lucide.createIcons();
}

async function openSellerProfile(tag, section = 'listings', { pushState = true } = {}) {
    currentSellerProfileTag = tag;
    if (tag === userProfile.tag) {
        showSection('profile-section');
        switchMyProfileSection(section);
        return;
    }
    const content = document.getElementById('externalProfileContent');
    if (content) content.innerHTML = getSellerProfileSkeletonHTML();
    const profileRow = await fetchProfileByTag(tag);
    if (!profileRow?.id) {
        showToast('Seller profile not found', 'alert-circle');
        if (content) {
            content.innerHTML = `<div style="padding: 40px; text-align: center; color: var(--text-muted);"><i data-lucide="user-x" style="width: 44px; height: 44px;"></i><p style="margin-top: 12px;">Profile not found.</p></div>`;
            lucide.createIcons();
        }
        return;
    }
    const seller = mapProfileRowToSeller(profileRow);
    const from = getActiveSectionId();
    const fromListingId = from === 'listing-detail-section' ? currentListingDetailId : null;
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
    const sellerListings = listings.filter((l) => l?.owner_id && l.owner_id === profileRow.id);
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
                <button class="profile-switch-btn" id="sellerReviewsTab" type="button" onclick="switchSellerProfileSection('reviews')">
                    <i data-lucide="star"></i>
                    <span>Avis</span>
                </button>
            </div>
            <div id="sellerListingsSection" class="profile-section-panel active">
                ${sellerListings.length > 0 ? `<h3>Annonces de ${seller.name}</h3><div class="listings-grid">${sellerListings.map(l => createCardHTML(l)).join('')}</div>` : '<div style="text-align: center; padding: 40px; color: var(--text-muted);"><i data-lucide="shopping-bag" style="width: 48px; height: 48px; margin-bottom: 15px; opacity: 0.5;"></i><p>Cet utilisateur n\'a pas encore d\'annonces publiées.</p></div>'}
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
    switchSellerProfileSection(section);
    initSellerProfileFollowUI(profileRow.id);
    fetchProfileRatingSummary(profileRow.id).then((summary) => {
        if (String(currentSellerProfileOwnerId || '') !== String(profileRow.id || '')) return;
        profileRatingSummaryCache.set(String(profileRow.id), summary);
        const el = document.getElementById('sellerProfileRatingContainer');
        if (el) el.innerHTML = getRatingHTML(summary.rating, summary.reviews);
        lucide.createIcons();
    });
    lucide.createIcons();
}

function openLightbox(imageSrc) {
    document.getElementById('lightboxImage').src = imageSrc;
    document.getElementById('imageLightbox').classList.add('active');
}

function closeLightbox() {
    document.getElementById('imageLightbox').classList.remove('active');
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
        chat.messages.push({ id: newMessageId(), type: 'sent', kind: 'text', text: message, time: "À l'instant" });
        input.value = '';
        await switchChat(activeChatTag);
        return;
    }
    const client = initSupabase();
    if (!client || !currentSupabaseUserId || !chat.userId) {
        showToast('Messaging is not ready', 'alert-circle');
        return;
    }
    let error = null;
    if (messagesHasMediaColumns !== false) {
        const res = await client.from('messages').insert({
            sender_id: currentSupabaseUserId,
            receiver_id: chat.userId,
            body: message,
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
                body: message
            });
            error = retry.error;
        } else if (!error) {
            messagesHasMediaColumns = true;
        }
    } else {
        const res = await client.from('messages').insert({
            sender_id: currentSupabaseUserId,
            receiver_id: chat.userId,
            body: message
        });
        error = res.error;
    }
    if (error) {
        if (isMessagingBackendMissing(error)) showToast('Messaging backend is not set up yet', 'alert-circle');
        else showToast(error.message || 'Failed to send message', 'alert-circle');
        return;
    }
    await createNotificationFromClient({
        recipientId: chat.userId,
        type: 'message_received',
        targetProfileId: chat.userId,
        meta: { chat: `id:${String(chat.userId)}` }
    });
    input.value = '';
    await refreshLiveChatsFromSupabase();
    renderMessagesList();
    await switchChat(activeChatTag);
}

async function sendMessageModal() {
    const input = document.getElementById('chatInputModal');
    if (!input) return;
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
        chat.messages.push({ id: newMessageId(), type: 'sent', kind: 'text', text: message, time: "À l'instant" });
        input.value = '';
        await switchChat(activeChatTag, true);
        return;
    }
    const client = initSupabase();
    if (!client || !currentSupabaseUserId || !chat.userId) {
        showToast('Messaging is not ready', 'alert-circle');
        return;
    }
    let error = null;
    if (messagesHasMediaColumns !== false) {
        const res = await client.from('messages').insert({
            sender_id: currentSupabaseUserId,
            receiver_id: chat.userId,
            body: message,
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
                body: message
            });
            error = retry.error;
        } else if (!error) {
            messagesHasMediaColumns = true;
        }
    } else {
        const res = await client.from('messages').insert({
            sender_id: currentSupabaseUserId,
            receiver_id: chat.userId,
            body: message
        });
        error = res.error;
    }
    if (error) {
        if (isMessagingBackendMissing(error)) showToast('Messaging backend is not set up yet', 'alert-circle');
        else showToast(error.message || 'Failed to send message', 'alert-circle');
        return;
    }
    await createNotificationFromClient({
        recipientId: chat.userId,
        type: 'message_received',
        targetProfileId: chat.userId,
        meta: { chat: `id:${String(chat.userId)}` }
    });
    input.value = '';
    await refreshLiveChatsFromSupabase();
    renderMessagesList();
    await switchChat(activeChatTag, true);
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
