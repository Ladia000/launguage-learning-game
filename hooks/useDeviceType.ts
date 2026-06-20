import { useWindowDimensions } from 'react-native';

export const useDeviceType = () => {
  const { width } = useWindowDimensions();
  return {
    isTablet: width >= 768,
    isPhone: width < 768,
    width,
  };
};
