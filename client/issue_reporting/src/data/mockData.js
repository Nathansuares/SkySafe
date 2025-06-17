// Mock data for the application
export const mockData = {
    personalDocs: [
        { id: 1, name: 'Indian Driving License', issue: 'Bangalore issue', issuedOn: '17 Jan 2003', expiry: '16 Mar 2028' },
        { id: 2, name: 'USA VISA', issue: 'Bangalore issue', issuedOn: '17 Jan 2013', expiry: '16 Dec 2023' },
        { id: 3, name: 'Medical Insurance', issue: 'Bangalore issue', issuedOn: '17 Jan 2012', expiry: '16 Feb 2026' },
    ],
    aircraftDocs: [
        { id: 1, name: 'Company SOP', details: 'Filler text' },
        { id: 2, name: 'Aircraft VT CFD', details: 'Filler text' },
        { id: 3, name: 'Aircraft VT SDY', details: 'Filler text' },
    ],
    regulatoryCirculars: [
        { id: 1, name: 'Aircraft Safety Main', issuedOn: '17 Jan 2003', expiry: 'Nill' },
        { id: 2, name: 'VISA Regulations India', issuedOn: '17 Jan 2013', expiry: '16 Dec 2023' },
        { id: 3, name: 'Main Safety Circular', issue: 'Bangalore issue', issuedOn: '11 Dec 2012', expiry: 'Nill' },
    ],
    internalCirculars: [
        { id: 1, name: 'Company Circular SOP', details: 'Filler text' },
        { id: 2, name: 'Aircraft Circular VT CFD', details: 'Filler text' },
        { id: 3, name: 'Aircraft Circular VT SDY', details: 'Filler text' },
    ]
};
