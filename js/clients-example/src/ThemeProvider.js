import { ThemeProvider } from 'glamorous';
import { mapProps, compose } from 'recompose';
import { withTweekKeys } from 'react-tweek';
import ensureProp from './utils/ensureProp';
import { colors, layouts } from './theme';

export default compose(
  withTweekKeys('shop/view/_'),
  ensureProp('theme', Object.keys(colors)),
  ensureProp('layout', Object.keys(layouts)),
  mapProps(({ theme, layout, ...props }) => ({
    theme: {
      colors: colors[theme],
      layouts: layouts[layout],
    },
    ...props,
  })),
)(ThemeProvider);
