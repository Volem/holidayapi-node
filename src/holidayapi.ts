/**
 * Copyright (c) Gravity Boulevard, LLC
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import fetch from 'node-fetch';
import { URL, URLSearchParams } from 'url';
import {
  CountriesRequest,
  CountriesResponse,
  Endpoint,
  HolidaysRequest,
  HolidaysResponse,
  LanguagesRequest,
  LanguagesResponse,
  Requests,
  Responses,
  WorkdayRequest,
  WorkdayResponse,
} from './types';

export class HolidayAPI {
  baseUrl: string;
  key: string;

  constructor({ key, version = 1 }: { key?: string, version?: number }) {
    const getYours = 'get yours at HolidayAPI.com';
    const uuidRegExp = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;

    if (!key) {
      throw new Error(`Missing API key, ${getYours}`);
    }

    if (!uuidRegExp.test(key)) {
      throw new Error(`Invalid API key, ${getYours}`);
    }

    if (version !== 1) {
      throw new Error('Invalid version number, expected "1"');
    }

    this.baseUrl = `https://holidayapi.com/v${version}/`;
    this.key = key;
  }

  private createUrl(endpoint: Endpoint, request?: Requests): string {
    const parameters = { key: this.key, ...request } as any;
    const url = new URL(endpoint, this.baseUrl);
    url.search = new URLSearchParams(parameters).toString();
    return url.toString();
  }

  private async request(endpoint: Endpoint, request?: Requests): Promise<Responses> {
    const response = await fetch(this.createUrl(endpoint, request));
    let payload;

    try {
      payload = await response.json();
    } catch (err) {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(payload.error || response.statusText);
    }

    return payload;
  }

  async countries(request?: CountriesRequest): Promise<CountriesResponse> {
    return this.request('countries', request);
  }

  async holidays(request: HolidaysRequest = {}): Promise<HolidaysResponse> {
    if (!request.country) {
      throw new Error('Missing country');
    } else if (!request.year) {
      throw new Error('Missing year');
    } else if (request.previous && request.upcoming) {
      throw new Error('Previous and upcoming are mutually exclusive');
    }

    return this.request('holidays', request);
  }

  async languages(request?: LanguagesRequest): Promise<LanguagesResponse> {
    return this.request('languages', request);
  }

  async workday(request: WorkdayRequest = {}): Promise<WorkdayResponse> {
    if (!request.country) {
      throw new Error('Missing country');
    } else if (!request.start) {
      throw new Error('Missing start date');
    } else if (!request.days) {
      throw new Error('Missing days');
    } else if (request.days < 1) {
      throw new Error('Days must be 1 or more');
    }

    return this.request('workday', request);
  }
}
