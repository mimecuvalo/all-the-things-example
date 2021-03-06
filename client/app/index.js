import './index.css';

import * as serviceWorkerRegistration from './serviceWorkerRegistration';

import { IntlProvider, isInternalLocale, setupCreateIntl } from 'shared/util/i18n';

import { ApolloProvider } from '@apollo/client';
import App from './App';
import { JssProvider } from 'react-jss';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import { StrictMode } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import configuration from './configuration';
import createApolloClient from './apollo';
import murmurhash from 'murmurhash';
import reportWebVitals from './reportWebVitals';
import theme from 'shared/theme';

// XXX(mime): if we don't manually set generateClassName we get SSR/client mismatch upon
// hydration. See example: https://github.com/cssinjs/jss/issues/926
// I don't know wtf and have messed around with this for hours and hours.
// This works enough for now.
// Material v5 is migrating away from jss -> emotion and this might be fixed in v5.
const createGenerateClassName = () => (rule) => `${rule.key}-${murmurhash.v3(rule.toString())}`;
const generateClassName = createGenerateClassName();

async function renderAppTree(app) {
  const client = createApolloClient();

  let messages = {};
  // This is to dynamically load language packs as needed. We don't need them all client-side.
  const { locale, defaultLocale } = configuration;
  if (locale !== defaultLocale && !isInternalLocale(locale)) {
    messages = (await import(`shared/i18n-lang-packs/${locale}.json`)).default;
  }

  // createIntl is used in non-React locations.
  setupCreateIntl({ defaultLocale, locale, messages });

  return (
    <StrictMode>
      <IntlProvider defaultLocale={locale} locale={locale} messages={messages}>
        <ApolloProvider client={client}>
          <Router>
            <JssProvider generateId={generateClassName}>
              <ThemeProvider theme={theme}>{app}</ThemeProvider>
            </JssProvider>
          </Router>
        </ApolloProvider>
      </IntlProvider>
    </StrictMode>
  );
}

// We use `hydrate` here so that we attach to our server-side rendered React components.
async function render() {
  // TODO(mime): migrate window.configuration.user to LOCAL_STATE
  const appTree = await renderAppTree(<App user={window.configuration.user} />);
  ReactDOM.hydrate(appTree, document.getElementById('root'));
}
render();

// This enables hot module reloading for JS (HMR).
if (module.hot) {
  async function hotModuleRender() {
    const NextApp = require('./App').default;
    // TODO(mime): migrate window.configuration.user to LOCAL_STATE
    const appTree = await renderAppTree(<NextApp user={window.configuration.user} />);
    ReactDOM.render(appTree, document.getElementById('root'));
  }
  module.hot.accept('./App', hotModuleRender);
}

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
