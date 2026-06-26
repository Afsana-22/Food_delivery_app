import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          welcome: 'Cravings? Delivered Fast.',
          subtitle: 'Regional food, smart delivery zones, and live order intelligence for food lovers.',
          detect_location: 'Detect Me',
          search_placeholder: 'Try "Order dosa from nearest hotel" or search Kari dosa, Jigarthanda...',
          top_picks: 'Trending Near You',
          join_pro: 'Upgrade to Zaptaste Pro',
          pro_desc: 'Free delivery, faster slots, and exclusive local festival offers.',
          pure_veg: 'Pure Veg',
          rating_4plus: '4.5+ Rating',
          express: 'Express',
          add: 'Add to Bucket',
          cart: 'Cart',
          checkout: 'Checkout',
          track_order: 'Live Order DNA',
          eco_friendly: 'Opt out of plastic cutlery',
          custom_instructions: "Chef's Note",
          express_delivery: '20 MIN FAST',
          local_legends: 'Local Legends',
          ai_recommendation: 'AI food recommendation',
          festival_offers: 'Festival offers',
          home_chef: 'Home Chef',
          heatmap: 'Live delivery heatmap'
        }
      }
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
