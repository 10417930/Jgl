
import type { SimulatedState } from '../types';

interface VNode {
    tag: string;
    props: Record<string, any>;
    children: (VNode | string)[];
}

function createElement(vnode: VNode | string): HTMLElement | Text {
    if (typeof vnode === 'string' || typeof vnode === 'number') {
        return document.createTextNode(String(vnode));
    }

    const el = document.createElement(vnode.tag);
    for (const [key, value] of Object.entries(vnode.props || {})) {
        if (key.startsWith('on') && typeof value === 'function') {
            el.addEventListener(key.substring(2).toLowerCase(), value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(el.style, value);
        } else {
            el.setAttribute(key, String(value));
        }
    }

    (vnode.children || []).forEach(child => {
        el.appendChild(createElement(child));
    });

    return el;
}

export function renderDsl(
    code: string,
    state: SimulatedState,
    container: HTMLElement,
    execute: (action: string) => void,
    log: (message: string) => void
) {
    const api = {
        Column: (fn: Function): VNode => {
            const children: (VNode|string)[] = [];
            if (fn) fn((child: VNode|string) => children.push(child));
            return { tag: 'div', props: { style: { display: 'flex', flexDirection: 'column', gap: '8px' } }, children };
        },
        Row: (fn: Function): VNode => {
            const children: (VNode|string)[] = [];
            if (fn) fn((child: VNode|string) => children.push(child));
            return { tag: 'div', props: { style: { display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' } }, children };
        },
        Text: (getter: () => string | string): VNode => {
            const text = typeof getter === 'function' ? getter() : String(getter || '');
            return { tag: 'div', props: { style: { fontSize: '14px', color: '#e6f6ff' } }, children: [text] };
        },
        Button: (onClick: () => void | string, label: () => string | string): VNode => {
            const handler = () => {
                try {
                    if (typeof onClick === 'string') execute(onClick);
                    else if (typeof onClick === 'function') onClick();
                } catch (e) { log(`Action error: ${(e as Error).message}`); }
            };
            const labelText = typeof label === 'function' ? label() : String(label || 'Button');
            return {
                tag: 'button',
                props: {
                    className: "bg-sky-700 text-white border-none px-3 py-1.5 rounded-lg transition-opacity hover:opacity-90 active:opacity-80",
                    onClick: handler
                },
                children: [labelText]
            };
        },
        Image: (src: string, opts: { width?: number } = {}): VNode => ({
            tag: 'img',
            props: { src, style: { maxWidth: opts.width || 120, borderRadius: '8px' } },
            children: []
        }),
        LazyColumn: (items: any[], renderItem: (item: any, index: number) => VNode): VNode => {
            const children = (items || []).map((it, i) => {
                try {
                    return renderItem(it, i);
                } catch (e) {
                    log(`LazyColumn item render error: ${(e as Error).message}`);
                    return { tag: 'div', props: { className: 'text-red-500' }, children: [`Error rendering item ${i}`] };
                }
            });
            return { tag: 'div', props: { style: { display: 'flex', flexDirection: 'column', gap: '6px' } }, children };
        },
    };

    const sandboxFn = new Function('api', 'state', 'execute', 'log', `
      const { Column, Row, Text, Button, Image, LazyColumn } = api;
      let rootNode = null;
      const render = (fn) => {
          rootNode = fn();
      };
      
      // Wrap children collection in composables
      const originalColumn = Column;
      api.Column = (fn) => originalColumn(() => {
        const children = [];
        fn((child) => children.push(child));
        return children;
      });
      const originalRow = Row;
      api.Row = (fn) => originalRow(() => {
        const children = [];
        fn((child) => children.push(child));
        return children;
      });

      try {
        ${code}
        return rootNode;
      } catch (e) {
        log('DSL Execution Error: ' + e.message);
        throw e;
      }
    `);
    
    const vnode = sandboxFn(api, state, execute, log);
    
    if (vnode) {
        container.appendChild(createElement(vnode));
    } else {
        log('Render function did not return a valid element.');
    }
}
