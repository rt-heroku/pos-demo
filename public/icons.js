// public/icons.js - All icon components
const iconProps = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };

window.Icons = {
    ShoppingCart: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('circle', { key: 'circle1', cx: "9", cy: "21", r: "1" }),
        React.createElement('circle', { key: 'circle2', cx: "20", cy: "21", r: "1" }),
        React.createElement('path', { key: 'path', d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" })
    ]),

    Plus: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M12 5v14" }),
        React.createElement('path', { key: 'path2', d: "M5 12h14" })
    ]),

    Minus: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path', d: "M5 12h14" })
    ]),

    X: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M18 6 6 18" }),
        React.createElement('path', { key: 'path2', d: "M6 6l12 12" })
    ]),

    Search: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('circle', { key: 'circle', cx: "11", cy: "11", r: "8" }),
        React.createElement('path', { key: 'path', d: "M21 21l-4.35-4.35" })
    ]),

    Package: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" }),
        React.createElement('path', { key: 'path2', d: "M3.29 7 12 12l8.71-5" }),
        React.createElement('path', { key: 'path3', d: "M12 22V12" })
    ]),

    BarChart3: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M3 3v18h18" }),
        React.createElement('path', { key: 'path2', d: "M18 17V9" }),
        React.createElement('path', { key: 'path3', d: "M13 17V5" }),
        React.createElement('path', { key: 'path4', d: "M8 17v-3" })
    ]),

    Users: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
        React.createElement('circle', { key: 'circle1', cx: "9", cy: "7", r: "4" }),
        React.createElement('path', { key: 'path2', d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
        React.createElement('path', { key: 'path3', d: "M16 3.13a4 4 0 0 1 0 7.75" })
    ]),

    Award: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('circle', { key: 'circle', cx: "12", cy: "8", r: "7" }),
        React.createElement('polyline', { key: 'polyline1', points: "8.21,13.89 7,23 12,20 17,23 15.79,13.88" })
    ]),

    Edit: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" }),
        React.createElement('path', { key: 'path2', d: "M15 5l4 4" })
    ]),

    Trash2: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M3 6h18" }),
        React.createElement('path', { key: 'path2', d: "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }),
        React.createElement('path', { key: 'path3', d: "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }),
        React.createElement('line', { key: 'line1', x1: "10", x2: "10", y1: "11", y2: "17" }),
        React.createElement('line', { key: 'line2', x1: "14", x2: "14", y1: "11", y2: "17" })
    ]),

    DollarSign: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('line', { key: 'line1', x1: "12", x2: "12", y1: "1", y2: "23" }),
        React.createElement('path', { key: 'path', d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" })
    ]),

    Receipt: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" }),
        React.createElement('path', { key: 'path2', d: "M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" }),
        React.createElement('path', { key: 'path3', d: "M12 18V6" })
    ]),

    Save: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" }),
        React.createElement('polyline', { key: 'polyline', points: "17,21 17,13 7,13 7,21" }),
        React.createElement('polyline', { key: 'polyline2', points: "7,3 7,8 15,8" })
    ])
};