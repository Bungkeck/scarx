import { NextResponse } from 'next/server';
import ip2locationio from 'ip2location-io-nodejs';

export async function GET(request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.socket.remoteAddress;

    const apiKey = process.env.IP2LOCATION_API_KEY;
    const config = new ip2locationio.Configuration(apiKey);
    const ipl = new ip2locationio.IPGeolocation(config);

    const ipldata = await ipl.lookup(ip);

    return NextResponse.json({
      ip,
      location: {
        country: ipldata.country_name,
        city: ipldata.city_name,
        latitude: ipldata.latitude,
        longitude: ipldata.longitude,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch IP or location' }, { status: 500 });
  }
}
