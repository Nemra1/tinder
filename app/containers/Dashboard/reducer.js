/*
 *
 * Dashboard reducer
 *
 */

import { fromJS } from 'immutable';
import {
  FETCH_TINDER_DATA,
  FETCH_TINDER_DATA_ERROR,
  FETCH_TINDER_DATA_SUCCESS,
  FETCH_MATCHES,
  FETCH_MATCHES_SUCCESS,
  FETCH_MATCHES_ERROR,
  FETCH_UPDATES,
  FETCH_UPDATES_SUCCESS,
  FETCH_UPDATES_END,
  FETCH_UPDATES_ERROR,
  REMOVE_MATCH,
  SORT_MATCHES,
} from './constants';

import {
  EDITING_BIO,
} from 'containers/MainDashboard/constants';

import { normalize, arrayOf } from 'normalizr';
import * as schema from 'utils/schema';

import {
  matchesSortByDistance,
  matchesSortByLastActive,
  matchesSortByYoungest,
  matchesSortByOldest,
} from 'utils/operations';
import { LOCATION_CHANGE } from 'react-router-redux';

const initialState = fromJS({
  user: '',
  rating: '',
  history: '',
  matches: '',
  recommendations: '',
  lastError: '',
  updates: [],
  isFetching: false,
});

const sortMapping = {
  distance: matchesSortByDistance,
  lastActive: matchesSortByLastActive,
  youngest: matchesSortByYoungest,
  oldest: matchesSortByOldest,
};

function dashboardReducer(state = initialState, action) {
  switch (action.type) {
    case FETCH_TINDER_DATA:
    case FETCH_MATCHES:
    case FETCH_UPDATES:
      return state
        .set('isFetching', true);
    case FETCH_MATCHES_SUCCESS:
      return state
        .set('isFetching', false)
        .set('recommendations', fromJS(action.payload));
    case FETCH_TINDER_DATA_SUCCESS:
      console.log(normalize(action.payload[1], { matches: arrayOf(schema.match) }));
      return state
        .set('isFetching', false)
        .set('user', fromJS(action.user))
        .set('rating', fromJS(action.rating))
        .set('history', fromJS(action.history))
        .set('matches', fromJS(action.matches))
        .set('recommendations', action.recommendations ? fromJS(action.recommendations) : fromJS(state.get('recommendations')));
    case FETCH_UPDATES_SUCCESS:
      return state
        .set('updates', (state.get('updates').length > 20) ? state.get('updates').splice(1, 20).concat([action.payload]) : state.get('updates').concat([action.payload]));
    case FETCH_TINDER_DATA_ERROR:
    case FETCH_MATCHES_ERROR:
    case FETCH_UPDATES_ERROR:
      return state
        .set('lastError', action.payload)
        .set('isFetching', false);
    case EDITING_BIO:
      return state.setIn(['user', 'bio'], action.payload.length <= 500 ? action.payload : state.getIn(['user', 'bio']));
    case FETCH_UPDATES_END:
      return state
        .set('isFetching', false);
    case LOCATION_CHANGE:
      return state.set('isFetching', false);
    case SORT_MATCHES:
      return state.set('recommendations', action.payload === 'normal' ? state.get('recommendations') : fromJS(state.get('recommendations').toJS().splice(0).sort(sortMapping[action.payload])));
    case REMOVE_MATCH:
      return state
        .set('recommendations', fromJS(state.get('recommendations').toJS().filter((each) => each._id !== action.id)));
    default:
      return state;
  }
}

export default dashboardReducer;
