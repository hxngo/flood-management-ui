import { NextRequest, NextResponse } from 'next/server';
// 타입 정의는 별도 파일(src/types/google-earthengine.d.ts)로 분리했습니다
import ee from '@google/earthengine';

// Earth Engine initialization status
let initialized = false;

/**
 * Initialize Earth Engine with private key
 */
async function initializeEarthEngine() {
  if (initialized) return true;
  
  try {
    // For demo purposes - in production you should use service account credentials
    const PRIVATE_KEY = process.env.EARTH_ENGINE_PRIVATE_KEY;
    
    if (!PRIVATE_KEY) {
      console.error('Earth Engine private key not found');
      return false;
    }
    
    await new Promise((resolve, reject) => {
      ee.data.authenticateViaPrivateKey(JSON.parse(PRIVATE_KEY), () => {
        ee.initialize(null, null, () => {
          initialized = true;
          resolve(true);
        }, (err) => {
          reject(err);
        });
      }, (err) => {
        reject(err);
      });
    });
    
    return true;
  } catch (error) {
    console.error('Earth Engine initialization error:', error);
    return false;
  }
}

/**
 * Get satellite imagery for a specific location and year
 */
export async function GET(request: NextRequest) {
  try {
    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const year = searchParams.get('year') || '2024';
    const lat = parseFloat(searchParams.get('lat') || '11.2138');
    const lng = parseFloat(searchParams.get('lng') || '35.0930');
    
    // Initialize Earth Engine (if needed)
    const initialized = await initializeEarthEngine().catch((err: Error) => {
      console.error('Failed to initialize Earth Engine:', err);
      return false;
    });
    
    if (!initialized) {
      // Fallback to static images for demo
      return NextResponse.json({
        success: false,
        error: 'Earth Engine initialization failed',
        // Provide fallback URL to local static image
        fallbackUrl: `/satellite/${year}.jpg`,
        message: 'Using fallback static imagery'
      });
    }
    
    // Create a point of interest
    const point = ee.Geometry.Point([lng, lat]);
    
    // Get appropriate collection based on year
    let collection;
    const yearNum = parseInt(year);
    if (yearNum <= 2013) {
      collection = ee.ImageCollection('LANDSAT/LE07/C02/T1_TOA'); // Landsat 7
    } else if (yearNum <= 2017) {
      collection = ee.ImageCollection('LANDSAT/LC08/C02/T1_TOA'); // Landsat 8
    } else {
      collection = ee.ImageCollection('LANDSAT/LC09/C02/T1_TOA'); // Landsat 9
    }
    
    // Filter by date range for that year (use cloud-free months)
    const startDate = `${year}-05-01`;
    const endDate = `${year}-09-30`;
    collection = collection.filterDate(startDate, endDate);
    
    // Filter by location
    collection = collection.filterBounds(point);
    
    // Sort by cloud cover and get the least cloudy scene
    const image = collection.sort('CLOUD_COVER').first();
    
    // Create visualization parameters for true color
    const vizParams = {
      bands: ['B4', 'B3', 'B2'],
      min: 0,
      max: 0.4,
      gamma: 1.2
    };
    
    // Generate the map tile URL
    const mapId: any = await new Promise((resolve, reject) => {
      image.getMapId(vizParams, (mapId: any, error: Error | null) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(mapId);
      });
    });
    
    return NextResponse.json({
      success: true,
      year,
      tileUrl: mapId.tile_fetcher.url_format,
      mapId: mapId.mapid,
      token: mapId.token,
    });
  } catch (error: any) {
    console.error('API error:', error);
    const year = request.nextUrl.searchParams.get('year') || '2024';
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to fetch satellite imagery',
      fallbackUrl: `/satellite/${year}.jpg`,
    }, { status: 500 });
  }
}
