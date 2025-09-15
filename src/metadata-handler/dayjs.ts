import djs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';

djs.extend(utc);
djs.extend(customParseFormat);

export default djs;
