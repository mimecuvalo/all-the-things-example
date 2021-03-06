import './analytics';
import './App.css';

import { Route, Switch } from 'react-router-dom';
import { SnackbarProvider, useSnackbar } from 'notistack';
import { defineMessages, useIntl } from 'shared/util/i18n';
import { useEffect, useState } from 'react';

import AdminApp from 'client/admin';
import CloseIcon from '@material-ui/icons/Close';
import ErrorBoundary from 'client/error/ErrorBoundary';
import IconButton from '@material-ui/core/IconButton';
import MainApp from './Main';
import UserContext from './User_Context';
import classNames from 'classnames';
import clientHealthCheck from './client_health_check';

const messages = defineMessages({
  close: { defaultMessage: 'Close' },
});

// This is the main entry point on the client-side.
export default function App({ user }) {
  const [userContext] = useState({ user });
  const [devOnlyHiddenOnLoad, setDevOnlyHiddenOnLoad] = useState(process.env.NODE_ENV === 'development');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (loaded) {
      return;
    }

    // Remove MaterialUI's SSR generated CSS.
    const jssStyles = document.getElementById('jss-ssr');
    if (jssStyles?.parentNode) {
      jssStyles.parentNode.removeChild(jssStyles);
    }

    // Upon starting the app, kick off a client health check which runs periodically.
    clientHealthCheck();

    setDevOnlyHiddenOnLoad(false);
    setLoaded(true);
  }, [devOnlyHiddenOnLoad, loaded]);

  // XXX(all-the-things): we can't get rid of FOUC in dev mode because we want hot reloading of CSS updates.
  // This hides the unsightly unstyled app. However, in dev mode, it removes the perceived gain of SSR. :-/
  const devOnlyHiddenOnLoadStyle = devOnlyHiddenOnLoad ? { opacity: 0 } : null;

  return (
    <UserContext.Provider value={userContext}>
      <SnackbarProvider action={<CloseButton />}>
        <ErrorBoundary>
          <div
            className={classNames('App', {
              'App-logged-in': true,
              'App-is-development': process.env.NODE_ENV === 'development',
            })}
            style={devOnlyHiddenOnLoadStyle}
          >
            <Switch>
              <Route path="/admin" component={AdminApp} />
              <Route component={MainApp} />
            </Switch>
          </div>
        </ErrorBoundary>
      </SnackbarProvider>
    </UserContext.Provider>
  );
}

function CloseButton(snackKey) {
  const intl = useIntl();
  const snackbar = useSnackbar();
  const closeAriaLabel = intl.formatMessage(messages.close);

  return (
    <IconButton
      key="close"
      onClick={() => snackbar.closeSnackbar(snackKey)}
      className="App-snackbar-icon"
      color="inherit"
      aria-label={closeAriaLabel}
    >
      <CloseIcon />
    </IconButton>
  );
}
