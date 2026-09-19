import React, { useState, useEffect } from 'react';
import {
  useParams,
  useNavigate,
  useLocation,
} from 'react-router-dom';
import { useIsFetching, useQuery, useQueryClient } from '@tanstack/react-query';
import { Header, type PageTab } from './components/Header';
import { LocationBar } from './components/LocationBar';
import { OverviewPage } from './pages/OverviewPage';
import { PlannerPage } from './pages/PlannerPage';
import { ComparePage } from './pages/ComparePage';
import { HistoryPage } from './pages/HistoryPage';
import { WeatherSkeleton } from './components/WeatherSkeleton';
import { ErrorMessage } from './components/ErrorMessage';
import {
  findLocationBySlug,
  findNearestLocation,
  fetchWeatherData,
  type LocationItem,
} from './api/weatherApi';

const FAVORITES_STORAGE_KEY = 'nang_mua_favorites';

export const NangMuaApp: React.FC = () => {
  const { locationSlug, page } = useParams<{ locationSlug?: string; page?: string }>();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const queryClient = useQueryClient();
  const archiveIsFetching = useIsFetching({ queryKey: ['archive'] });

  // Selected location from URL or fallback
  const currentLocation: LocationItem = findLocationBySlug(locationSlug || 'ha-noi');

  // Selected tab
  const validPages: PageTab[] = ['tong-quan', 'khung-gio', 'so-sanh', 'lich-su'];
  const currentPage: PageTab = validPages.includes(page as PageTab)
    ? (page as PageTab)
    : 'tong-quan';

  // Favorites from localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? [...new Set(parsed.filter((slug): slug is string => typeof slug === 'string'))]
        : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (slug: string) => {
    setFavorites(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [slug, ...prev];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error('Failed to save favorites to localStorage', e);
      }
      return next;
    });
  };

  // Check geolocation on very first visit if on root '/'
  useEffect(() => {
    if (routerLocation.pathname === '/' || !locationSlug) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            const nearest = findNearestLocation(pos.coords.latitude, pos.coords.longitude);
            navigate(`/${nearest.slug}/tong-quan`, { replace: true });
          },
          () => {
            // Default fallback
            navigate(`/ha-noi/tong-quan`, { replace: true });
          },
          { timeout: 5000 }
        );
      } else {
        navigate(`/ha-noi/tong-quan`, { replace: true });
      }
    }
  }, [locationSlug, routerLocation.pathname, navigate]);

  // TanStack Query for weather data (cached 30 minutes)
  const {
    data: weatherData,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['weather', currentLocation.slug],
    queryFn: () => fetchWeatherData(currentLocation),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const handleSelectLocation = (loc: LocationItem) => {
    navigate(`/${loc.slug}/${currentPage}`);
  };

  const handleSelectPage = (nextPage: PageTab) => {
    navigate(`/${currentLocation.slug}/${nextPage}`);
  };

  return (
    <div className="min-h-screen bg-bg text-ink selection:bg-acc-soft selection:text-acc px-[22px] pt-[26px] pb-[80px]">
      <div className="max-w-[1080px] mx-auto">
        {/* Common Header */}
        <Header
          currentPage={currentPage}
          onSelectPage={handleSelectPage}
          updatedAt={weatherData?.updatedAt || 'Đang cập nhật...'}
          isFetching={isFetching || archiveIsFetching > 0}
          onRefresh={() => {
            void refetch();
            void queryClient.invalidateQueries({ queryKey: ['archive'] });
          }}
        />

        {/* Common Location Bar */}
        <LocationBar
          currentLocation={currentLocation}
          currentTemperature={weatherData?.tempNow}
          onSelectLocation={handleSelectLocation}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
        />

        {/* Page Content */}
        {currentPage === 'so-sanh' ? (
          <main><ComparePage currentLocation={currentLocation} /></main>
        ) : currentPage === 'lich-su' ? (
          <main><HistoryPage currentLocation={currentLocation} /></main>
        ) : isLoading && !weatherData ? (
          <WeatherSkeleton />
        ) : isError && !weatherData ? (
          <ErrorMessage
            locationName={currentLocation.name}
            onRetry={() => refetch()}
          />
        ) : (
          weatherData && (
            <main>
              {currentPage === 'tong-quan' && <OverviewPage data={weatherData} />}
              {currentPage === 'khung-gio' && <PlannerPage data={weatherData} />}
            </main>
          )
        )}
      </div>
    </div>
  );
};
