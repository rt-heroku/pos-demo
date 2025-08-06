window.Icons = {
    ...window.Icons, // Keep existing icons

    // New icons for enhanced features
    Moon: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path', d: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" })
    ]),

    Sun: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "5" }),
        React.createElement('path', { key: 'path1', d: "M12 1v2" }),
        React.createElement('path', { key: 'path2', d: "M12 21v2" }),
        React.createElement('path', { key: 'path3', d: "M4.22 4.22l1.42 1.42" }),
        React.createElement('path', { key: 'path4', d: "M18.36 18.36l1.42 1.42" }),
        React.createElement('path', { key: 'path5', d: "M1 12h2" }),
        React.createElement('path', { key: 'path6', d: "M21 12h2" }),
        React.createElement('path', { key: 'path7', d: "M4.22 19.78l1.42-1.42" }),
        React.createElement('path', { key: 'path8', d: "M18.36 5.64l1.42-1.42" })
    ]),

    MapPin: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" }),
        React.createElement('circle', { key: 'circle', cx: "12", cy: "10", r: "3" })
    ]),

    CreditCard: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('rect', { key: 'rect', width: "20", height: "14", x: "2", y: "5", rx: "2" }),
        React.createElement('line', { key: 'line1', x1: "2", x2: "22", y1: "10", y2: "10" })
    ]),

    Percent: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('line', { key: 'line1', x1: "19", x2: "5", y1: "5", y2: "19" }),
        React.createElement('circle', { key: 'circle1', cx: "6.5", cy: "6.5", r: "2.5" }),
        React.createElement('circle', { key: 'circle2', cx: "17.5", cy: "17.5", r: "2.5" })
    ]),

    Calendar: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('rect', { key: 'rect', width: "18", height: "18", x: "3", y: "4", rx: "2", ry: "2" }),
        React.createElement('line', { key: 'line1', x1: "16", x2: "16", y1: "2", y2: "6" }),
        React.createElement('line', { key: 'line2', x1: "8", x2: "8", y1: "2", y2: "6" }),
        React.createElement('line', { key: 'line3', x1: "3", x2: "21", y1: "10", y2: "10" })
    ]),

    Clock: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "10" }),
        React.createElement('polyline', { key: 'polyline', points: "12,6 12,12 16,14" })
    ]),

    CheckCircle: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
        React.createElement('polyline', { key: 'polyline', points: "22,4 12,14.01 9,11.01" })
    ]),

    AlertCircle: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('circle', { key: 'circle', cx: "12", cy: "12", r: "10" }),
        React.createElement('line', { key: 'line1', x1: "12", x2: "12", y1: "8", y2: "12" }),
        React.createElement('line', { key: 'line2', x1: "12", x2: "12.01", y1: "16", y2: "16" })
    ]),

    Tool: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" })
    ]),

    Wrench: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path', d: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" })
    ]),

    User: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" }),
        React.createElement('circle', { key: 'circle', cx: "12", cy: "7", r: "4" })
    ]),

    FileText: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M14,2 L14,8 L20,8 M14,2 L20,8 L20,20 C20,21.1 19.1,22 18,22 L6,22 C4.9,22 4,21.1 4,20 L4,4 C4,2.9 4.9,2 6,2 L14,2 Z" }),
        React.createElement('line', { key: 'line1', x1: "16", x2: "8", y1: "13", y2: "13" }),
        React.createElement('line', { key: 'line2', x1: "16", x2: "8", y1: "17", y2: "17" }),
        React.createElement('line', { key: 'line3', x1: "10", x2: "8", y1: "9", y2: "9" })
    ]),

    Phone: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path', d: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" })
    ]),

    Mail: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" }),
        React.createElement('polyline', { key: 'polyline', points: "22,6 12,13 2,6" })
    ]),

    Building: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" }),
        React.createElement('path', { key: 'path2', d: "M6 12H4a2 2 0 0 0-2 2v8h4" }),
        React.createElement('path', { key: 'path3', d: "M18 9h2a2 2 0 0 1 2 2v11h-4" }),
        React.createElement('path', { key: 'path4', d: "M10 6h4" }),
        React.createElement('path', { key: 'path5', d: "M10 10h4" }),
        React.createElement('path', { key: 'path6', d: "M10 14h4" }),
        React.createElement('path', { key: 'path7', d: "M10 18h4" })
    ]),

    Tag: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('path', { key: 'path1', d: "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42l-8.704-8.704Z" }),
        React.createElement('circle', { key: 'circle', cx: "7.5", cy: "7.5", r: ".5" })
    ]),

    Hash: (props) => React.createElement('svg', { ...iconProps, ...props }, [
        React.createElement('line', { key: 'line1', x1: "4", x2: "20", y1: "9", y2: "9" }),
        React.createElement('line', { key: 'line2', x1: "4", x2: "20", y1: "15", y2: "15" }),
        React.createElement('line', { key: 'line3', x1: "10", x2: "8", y1: "3", y2: "21" }),
        React.createElement('line', { key: 'line4', x1: "16", x2: "14", y1: "3", y2: "21" })
    ])
};

// Make sure iconProps is still available
const iconProps = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" };