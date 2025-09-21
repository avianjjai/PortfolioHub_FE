const convertDateToEpoch = async (date: string): Promise<number | null> => {
    if (date) {
        return new Date(date).getTime();
    }
    return null;
}

const converEpochToDate = async (date: number | null): Promise<string | null> => {
    if (date) {
        return new Date(date).toISOString().split('T')[0];
    }
    return '';
}

export { convertDateToEpoch, converEpochToDate };