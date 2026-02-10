'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import { MapPin, Navigation, Star, Loader2, AlertCircle, Hospital, Search, Building2, Landmark, Locate } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sidebar } from "@/components/layout/sidebar";

// Types
interface HospitalData {
    id: string;
    name: string;
    address: string;
    location: {
        lat: number;
        lng: number;
    };
    rating: number | string;
    totalRatings: number;
    isOpen: boolean | null;
    type: 'government' | 'private' | 'unknown';
}

interface Location {
    lat: number;
    lng: number;
}

type HospitalFilter = 'all' | 'government' | 'private';

// Map configuration
const mapContainerStyle = {
    width: '100%',
    height: '100%',
    borderRadius: '16px',
};

// Terna Engineering College, Nerul (fallback location for demo)
const ternaCollegeLocation: Location = {
    lat: 19.0330,
    lng: 73.0297,
};

const libraries: ("places")[] = ['places'];

// Keywords to identify government hospitals
const GOVT_KEYWORDS = [
    'government', 'govt', 'district', 'civil', 'general hospital',
    'medical college', 'aiims', 'safdarjung', 'lok nayak', 'ram manohar lohia',
    'deen dayal', 'lady hardinge', 'kasturba', 'sanjay gandhi', 'bhagwan mahavir',
    'guru teg bahadur', 'gtb', 'ddu', 'hindu rao', 'aruna asaf ali',
    'babu jagjivan ram', 'bjr', 'lal bahadur shastri', 'rajiv gandhi',
    'esi', 'employees state', 'cantonment', 'military', 'army', 'naval',
    'municipal', 'corporation'
];

const HospitalLocator: React.FC = () => {
    const [userLocation, setUserLocation] = useState<Location | null>(null);
    const [hospitals, setHospitals] = useState<HospitalData[]>([]);
    const [filteredHospitals, setFilteredHospitals] = useState<HospitalData[]>([]);
    const [selectedHospital, setSelectedHospital] = useState<HospitalData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mapCenter, setMapCenter] = useState<Location>(ternaCollegeLocation);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<HospitalFilter>('all');
    const [locationName, setLocationName] = useState<string>('');
    const mapRef = useRef<google.maps.Map | null>(null);
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
    const searchInputRef = useRef<HTMLInputElement | null>(null);

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries,
    });

    // Classify hospital type based on name
    const classifyHospital = (name: string): 'government' | 'private' | 'unknown' => {
        const lowerName = name.toLowerCase();
        for (const keyword of GOVT_KEYWORDS) {
            if (lowerName.includes(keyword.toLowerCase())) {
                return 'government';
            }
        }
        return 'private';
    };

    // Filter hospitals when filter changes
    useEffect(() => {
        if (activeFilter === 'all') {
            setFilteredHospitals(hospitals);
        } else {
            setFilteredHospitals(hospitals.filter(h => h.type === activeFilter));
        }
    }, [activeFilter, hospitals]);

    // Setup autocomplete
    useEffect(() => {
        if (isLoaded && searchInputRef.current && !autocompleteRef.current) {
            autocompleteRef.current = new google.maps.places.Autocomplete(searchInputRef.current, {
                types: ['geocode', 'establishment'],
                fields: ['geometry', 'formatted_address', 'name'],
            });

            autocompleteRef.current.addListener('place_changed', () => {
                const place = autocompleteRef.current?.getPlace();
                if (place?.geometry?.location) {
                    const location: Location = {
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                    };
                    setUserLocation(location);
                    setMapCenter(location);
                    setLocationName(place.name || place.formatted_address || 'Selected Location');
                    setError(null);
                    if (mapRef.current) {
                        mapRef.current.panTo(location);
                        mapRef.current.setZoom(14);
                    }
                    searchNearbyHospitals(location);
                }
            });
        }
    }, [isLoaded]);

    // Auto-detect location on mount - prioritize GPS, fallback to Terna College
    useEffect(() => {
        if (isLoaded && !userLocation) {
            // Try geolocation FIRST (real GPS location)
            getUserLocation();
        }
    }, [isLoaded]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const searchNearbyHospitals = useCallback((location: Location) => {
        if (!mapRef.current) return;

        setLoading(true);
        setError(null);

        const service = new window.google.maps.places.PlacesService(mapRef.current);

        const request: google.maps.places.PlaceSearchRequest = {
            location: new window.google.maps.LatLng(location.lat, location.lng),
            radius: 5000,
            type: 'hospital',
        };

        service.nearbySearch(request, (results, status) => {
            setLoading(false);
            if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
                const hospitalData: HospitalData[] = results.map((place) => {
                    const name = place.name || 'Unknown Hospital';
                    return {
                        id: place.place_id || Math.random().toString(),
                        name,
                        address: place.vicinity || 'Address not available',
                        location: {
                            lat: place.geometry?.location?.lat() || 0,
                            lng: place.geometry?.location?.lng() || 0,
                        },
                        rating: place.rating || 'N/A',
                        totalRatings: place.user_ratings_total || 0,
                        isOpen: place.opening_hours?.isOpen?.() ?? null,
                        type: classifyHospital(name),
                    };
                });
                setHospitals(hospitalData);
            } else {
                setError('Could not find hospitals in this area. Try adjusting your location.');
            }
        });
    }, []);

    // Handle map click to set location
    const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (!e.latLng) return;
        const location: Location = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
        };
        setUserLocation(location);
        setMapCenter(location);
        setLocationName('📍 Clicked Location');
        setError(null);
        if (mapRef.current) {
            mapRef.current.panTo(location);
        }
        searchNearbyHospitals(location);
    }, [searchNearbyHospitals]);

    const getUserLocation = useCallback(() => {
        setLoading(true);
        setError(null);

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location: Location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setUserLocation(location);
                    setMapCenter(location);
                    setLocationName('📍 Your Current Location');
                    if (mapRef.current) {
                        mapRef.current.panTo(location);
                        mapRef.current.setZoom(14);
                    }
                    searchNearbyHospitals(location);
                },
                () => {
                    // GPS denied or failed — fallback to default location
                    const location = ternaCollegeLocation;
                    setUserLocation(location);
                    setMapCenter(location);
                    setLocationName('Terna Engineering College, Nerul (default)');
                    if (mapRef.current) {
                        mapRef.current.panTo(location);
                        mapRef.current.setZoom(14);
                    }
                    searchNearbyHospitals(location);
                },
                { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
            );
        } else {
            // Geolocation not supported — fallback
            const location = ternaCollegeLocation;
            setUserLocation(location);
            setMapCenter(location);
            setLocationName('Terna Engineering College, Nerul (default)');
            if (mapRef.current) {
                mapRef.current.panTo(location);
                mapRef.current.setZoom(14);
            }
            searchNearbyHospitals(location);
        }
    }, [searchNearbyHospitals]);

    const searchAtMapCenter = useCallback(() => {
        if (!mapRef.current) return;
        const center = mapRef.current.getCenter();
        if (center) {
            const location: Location = {
                lat: center.lat(),
                lng: center.lng(),
            };
            setUserLocation(location);
            setLocationName('Map Center');
            setError(null);
            searchNearbyHospitals(location);
        }
    }, [searchNearbyHospitals]);

    const handleSearchSubmit = useCallback(() => {
        if (!searchQuery.trim() || !isLoaded || !mapRef.current) return;

        const geocoder = new google.maps.Geocoder();
        setLoading(true);

        geocoder.geocode({ address: searchQuery }, (results, status) => {
            if (status === 'OK' && results && results[0]) {
                const location: Location = {
                    lat: results[0].geometry.location.lat(),
                    lng: results[0].geometry.location.lng(),
                };
                setUserLocation(location);
                setMapCenter(location);
                setLocationName(results[0].formatted_address || searchQuery);
                setError(null);
                if (mapRef.current) {
                    mapRef.current.panTo(location);
                    mapRef.current.setZoom(14);
                }
                searchNearbyHospitals(location);
            } else {
                setLoading(false);
                setError('Location not found. Try a different search term.');
            }
        });
    }, [searchQuery, isLoaded, searchNearbyHospitals]);

    const getDirections = (hospital: HospitalData) => {
        if (!userLocation) return;
        const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${hospital.location.lat},${hospital.location.lng}&travelmode=driving`;
        window.open(url, '_blank');
    };

    const calculateDistance = (hospital: HospitalData): string | null => {
        if (!userLocation) return null;
        const R = 6371;
        const dLat = ((hospital.location.lat - userLocation.lat) * Math.PI) / 180;
        const dLon = ((hospital.location.lng - userLocation.lng) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((userLocation.lat * Math.PI) / 180) *
            Math.cos((hospital.location.lat * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return distance.toFixed(1);
    };

    const getMarkerIcon = (type: 'government' | 'private' | 'unknown') => {
        const color = type === 'government' ? '#dc2626' : '#ef4444';
        const lightColor = type === 'government' ? '#f87171' : '#fca5a5';
        return {
            url: 'data:image/svg+xml,' + encodeURIComponent(`
                <svg width="48" height="56" viewBox="0 0 48 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <ellipse cx="24" cy="52" rx="10" ry="3" fill="rgba(0,0,0,0.2)"/>
                    <path d="M24 2C12.954 2 4 10.954 4 22c0 16 20 32 20 32s20-16 20-32C44 10.954 35.046 2 24 2z" fill="${color}"/>
                    <path d="M24 4C13.507 4 6 11.954 6 22c0 14 18 28 18 28s18-14 18-28C42 11.954 34.493 4 24 4z" fill="${lightColor}"/>
                    <circle cx="24" cy="22" r="14" fill="white"/>
                    <rect x="21" y="12" width="6" height="20" rx="2" fill="${color}"/>
                    <rect x="14" y="19" width="20" height="6" rx="2" fill="${color}"/>
                </svg>
            `),
            scaledSize: new window.google.maps.Size(48, 56),
            anchor: new window.google.maps.Point(24, 56),
        };
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className="flex-1 overflow-y-auto">
                    {loadError ? (
                        <div className="min-h-screen bg-background flex items-center justify-center p-6">
                            <Card className="max-w-md">
                                <CardContent className="p-8 text-center">
                                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Map Loading Error</h3>
                                    <p className="text-muted-foreground">Failed to load Google Maps. Please check your API key.</p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : !isLoaded ? (
                        <div className="min-h-screen bg-background flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                                <p className="text-muted-foreground font-medium">Loading maps...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Header */}
                            <header className="border-b border-border/50 px-6 py-4 sticky top-0 z-40 bg-background/80 backdrop-blur-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                                                <Hospital className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">Hospital Locator</h1>
                                                <p className="text-sm text-muted-foreground">Find nearest hospitals & emergency care</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            onClick={getUserLocation}
                                            disabled={loading}
                                            className="bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700"
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Locating...
                                                </>
                                            ) : (
                                                <>
                                                    <Locate className="w-4 h-4 mr-2" />
                                                    Auto Detect
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            onClick={searchAtMapCenter}
                                            disabled={loading}
                                            variant="outline"
                                        >
                                            Search Here
                                        </Button>
                                    </div>
                                </div>

                                {/* Search Bar */}
                                <div className="flex items-center gap-4">
                                    <div className="relative flex-1 max-w-lg flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                            <input
                                                ref={searchInputRef}
                                                type="text"
                                                placeholder="Search any location (e.g., Mumbai, Pune, Jaipur...)"
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        handleSearchSubmit();
                                                    }
                                                }}
                                                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleSearchSubmit}
                                            disabled={loading || !searchQuery.trim()}
                                            className="bg-gradient-to-r from-pink-500 to-red-600"
                                        >
                                            <MapPin className="w-4 h-4 mr-2" />
                                            Go
                                        </Button>
                                    </div>

                                    {/* Filter Tabs */}
                                    <div className="flex bg-secondary rounded-xl p-1 gap-1">
                                        <button
                                            onClick={() => setActiveFilter('all')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeFilter === 'all'
                                                ? 'bg-gradient-to-r from-pink-500 to-red-600 text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <Hospital className="w-4 h-4" />
                                            All
                                        </button>
                                        <button
                                            onClick={() => setActiveFilter('government')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeFilter === 'government'
                                                ? 'bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <Landmark className="w-4 h-4" />
                                            Govt
                                        </button>
                                        <button
                                            onClick={() => setActiveFilter('private')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeFilter === 'private'
                                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            <Building2 className="w-4 h-4" />
                                            Private
                                        </button>
                                    </div>
                                </div>
                            </header>

                            {/* Error Banner */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mx-6 mt-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                                        <p className="text-amber-700 dark:text-amber-500 text-sm font-medium">{error}</p>
                                    </div>
                                    <Button
                                        onClick={searchAtMapCenter}
                                        size="sm"
                                        className="bg-amber-600 hover:bg-amber-700"
                                    >
                                        Search Here
                                    </Button>
                                </motion.div>
                            )}

                            {/* Success Banner */}
                            {userLocation && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mx-6 mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                        <MapPin className="w-4 h-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-foreground text-sm font-medium">
                                            {locationName || 'Location set!'}
                                        </p>
                                        <p className="text-muted-foreground text-xs">
                                            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-xs">
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 bg-pink-500 rounded-full"></span>
                                            Govt: {hospitals.filter(h => h.type === 'government').length}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                                            Private: {hospitals.filter(h => h.type === 'private').length}
                                        </span>
                                    </div>
                                </motion.div>
                            )}

                            {/* Main Content */}
                            <main className="p-6">
                                <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
                                    {/* Map Section */}
                                    <div className="flex-1 bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden min-h-[500px] relative">
                                        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-pink-500 to-red-600 text-white px-3 py-2 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2">
                                            <span className="animate-pulse">👆</span>
                                            Click anywhere on map to set your exact location
                                        </div>
                                        <GoogleMap
                                            mapContainerStyle={mapContainerStyle}
                                            center={mapCenter}
                                            zoom={12}
                                            onLoad={onMapLoad}
                                            onClick={handleMapClick}
                                            options={{
                                                disableDefaultUI: false,
                                                zoomControl: true,
                                                streetViewControl: false,
                                                mapTypeControl: false,
                                                fullscreenControl: true,
                                            }}
                                        >
                                            {/* User Location Marker */}
                                            {userLocation && (
                                                <Marker
                                                    position={userLocation}
                                                    icon={{
                                                        url: 'data:image/svg+xml,' + encodeURIComponent(`
                                                            <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <circle cx="28" cy="28" r="24" fill="#ec4899" fill-opacity="0.25"/>
                                                                <circle cx="28" cy="28" r="16" fill="#ec4899" fill-opacity="0.4"/>
                                                                <circle cx="28" cy="28" r="10" fill="#ec4899" stroke="white" stroke-width="4"/>
                                                                <circle cx="28" cy="28" r="4" fill="white"/>
                                                            </svg>
                                                        `),
                                                        scaledSize: new window.google.maps.Size(56, 56),
                                                        anchor: new window.google.maps.Point(28, 28),
                                                    }}
                                                    title="Your Location"
                                                    zIndex={1000}
                                                />
                                            )}

                                            {/* Hospital Markers */}
                                            {filteredHospitals.map((hospital) => (
                                                <Marker
                                                    key={hospital.id}
                                                    position={hospital.location}
                                                    onClick={() => setSelectedHospital(hospital)}
                                                    icon={getMarkerIcon(hospital.type)}
                                                    zIndex={100}
                                                />
                                            ))}

                                            {/* Info Window */}
                                            {selectedHospital && (
                                                <InfoWindow
                                                    position={selectedHospital.location}
                                                    onCloseClick={() => setSelectedHospital(null)}
                                                >
                                                    <div className="p-2 max-w-[250px]">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedHospital.type === 'government'
                                                                ? 'bg-pink-100 text-pink-700'
                                                                : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {selectedHospital.type === 'government' ? 'GOVT' : 'PRIVATE'}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-bold text-slate-800 mb-1">{selectedHospital.name}</h3>
                                                        <p className="text-slate-500 text-sm mb-2">{selectedHospital.address}</p>
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                            <span className="text-sm text-slate-700">
                                                                {selectedHospital.rating} ({selectedHospital.totalRatings} reviews)
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={() => getDirections(selectedHospital)}
                                                            className="w-full py-2 bg-gradient-to-r from-pink-500 to-red-600 text-white rounded-lg text-sm font-bold hover:from-pink-600 hover:to-red-700 transition-colors"
                                                        >
                                                            🚗 Get Directions
                                                        </button>
                                                    </div>
                                                </InfoWindow>
                                            )}
                                        </GoogleMap>
                                    </div>

                                    {/* Hospital List */}
                                    <div className="w-full lg:w-96 space-y-4 max-h-[600px] overflow-y-auto">
                                        {filteredHospitals.length === 0 && !loading && (
                                            <Card>
                                                <CardContent className="p-8 text-center">
                                                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                                        <Hospital className="w-8 h-8 text-primary" />
                                                    </div>
                                                    <h3 className="font-bold text-foreground mb-2">Find Nearby Hospitals</h3>
                                                    <p className="text-muted-foreground text-sm">
                                                        {hospitals.length === 0
                                                            ? 'Search a location or click "Auto Detect" to find hospitals'
                                                            : `No ${activeFilter} hospitals found. Try "All" filter.`
                                                        }
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        )}

                                        {filteredHospitals.map((hospital, index) => (
                                            <motion.div
                                                key={hospital.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Card
                                                    onClick={() => {
                                                        setSelectedHospital(hospital);
                                                        mapRef.current?.panTo(hospital.location);
                                                    }}
                                                    className={`cursor-pointer transition-all hover:shadow-md ${selectedHospital?.id === hospital.id
                                                        ? 'border-primary shadow-md ring-2 ring-primary/20'
                                                        : ''
                                                        }`}
                                                >
                                                    <CardContent className="p-4">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${hospital.type === 'government'
                                                                ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400'
                                                                : 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400'
                                                                }`}>
                                                                {hospital.type === 'government' ? 'GOVT' : 'PRIVATE'}
                                                            </span>
                                                            {calculateDistance(hospital) && (
                                                                <span className="px-2 py-1 bg-primary/10 text-primary rounded-lg text-xs font-bold whitespace-nowrap">
                                                                    {calculateDistance(hospital)} km
                                                                </span>
                                                            )}
                                                        </div>

                                                        <h4 className="font-bold text-foreground text-sm mb-1">
                                                            {hospital.name}
                                                        </h4>

                                                        <p className="text-muted-foreground text-xs mb-3">{hospital.address}</p>

                                                        <div className="flex items-center gap-4 mb-3">
                                                            <div className="flex items-center gap-1">
                                                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                                                <span className="text-sm text-foreground">{hospital.rating}</span>
                                                            </div>
                                                            {hospital.isOpen !== null && (
                                                                <span className={`text-xs font-medium ${hospital.isOpen ? 'text-green-600 dark:text-green-400' : 'text-red-500'
                                                                    }`}>
                                                                    {hospital.isOpen ? '🟢 Open' : '🔴 Closed'}
                                                                </span>
                                                            )}
                                                        </div>

                                                        <Button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                getDirections(hospital);
                                                            }}
                                                            className="w-full bg-gradient-to-r from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700"
                                                        >
                                                            <Navigation className="w-4 h-4 mr-2" />
                                                            Get Directions
                                                        </Button>
                                                    </CardContent>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </main>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HospitalLocator;
