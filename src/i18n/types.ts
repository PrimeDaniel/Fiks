export type Language = 'en' | 'he';

export interface Translations {
    // Navigation
    nav: {
        home: string;
        myJobs: string;
        post: string;
        signIn: string;
        signOut: string;
        jobDetails: string;
        postJob: string;
        back: string;
    };
    // Home Screen
    home: {
        title: string;
        subtitle: string;
        latestJobs: string;
        available: string;
        noJobsFound: string;
        beFirst: string;
        postJob: string;
        loading: string;
    };
    // Categories
    categories: {
        all: string;
        electricity: string;
        plumbing: string;
        assembly: string;
        moving: string;
        painting: string;
    };
    // Job Card
    jobCard: {
        justNow: string;
        minutesAgo: string;
        hoursAgo: string;
        daysAgo: string;
        negotiable: string;
        tapToView: string;
        message: string;
        save: string;
        share: string;
        views: string;
        bids: string;
        verified: string;
    };
    // Job Detail
    jobDetail: {
        budgetOffer: string;
        openToOffers: string;
        postedBy: string;
        description: string;
        availability: string;
        yourBid: string;
        acceptJob: string;
        counterOffer: string;
        makeCounterOffer: string;
        originalOffer: string;
        yourPrice: string;
        messageOptional: string;
        explainPricing: string;
        submitOffer: string;
        loginRequired: string;
        signInAsPro: string;
        proAccountRequired: string;
        bidSubmitted: string;
        bidSentMessage: string;
        counterOfferSent: string;
        alreadyApplied: string;
        invalidPrice: string;
    };
    // My Jobs
    myJobs: {
        title: string;
        subtitle: string;
        incomingBids: string;
        newBids: string;
        noBidsYet: string;
        prosWillBid: string;
        noJobsPosted: string;
        postFirstJob: string;
        signInRequired: string;
        signInToView: string;
        yourBudget: string;
        approve: string;
        decline: string;
        approveBid: string;
        approveQuestion: string;
        rejectBid: string;
        rejectQuestion: string;
        success: string;
        approvedMessage: string;
        pro: string;
    };
    // Status
    status: {
        open: string;
        inProgress: string;
        completed: string;
        pending: string;
        accepted: string;
        rejected: string;
        approved: string;
    };
    // Login
    login: {
        welcome: string;
        subtitle: string;
        email: string;
        password: string;
        fullName: string;
        signIn: string;
        signUp: string;
        noAccount: string;
        haveAccount: string;
        selectRole: string;
        client: string;
        professional: string;
        clientDesc: string;
        professionalDesc: string;
    };
    // Create Job
    createJob: {
        title: string;
        whatNeedsDone: string;
        titlePlaceholder: string;
        category: string;
        selectCategory: string;
        description: string;
        descriptionPlaceholder: string;
        priceOffer: string;
        allowCounterOffers: string;
        counterOffersDesc: string;
        schedule: string;
        schedulePlaceholder: string;
        postJob: string;
        posting: string;
        fillRequired: string;
        jobPosted: string;
        jobPostedMessage: string;
    };
    // Common
    common: {
        cancel: string;
        ok: string;
        error: string;
        comingSoon: string;
        loading: string;
    };
    // Sidebar (Web)
    sidebar: {
        quickStats: string;
        totalJobs: string;
        activeBids: string;
        becomePro: string;
        becomeProDesc: string;
        getStarted: string;
        categories: string;
        recentActivity: string;
    };
}
