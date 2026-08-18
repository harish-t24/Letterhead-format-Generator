import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useRef } from 'react';

type WrapMode = 'inline' | 'left' | 'right' | 'tight' | 'break' | 'behind' | 'front';

function ResizableImageComponent(props: any) {
  const { node, updateAttributes, selected, deleteNode } = props;
  const { src, alt, width = '100%', alignment = 'center', textWrap = 'inline', offsetX = 0, offsetY = 0 } = node.attrs;
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [moveMode, setMoveMode] = React.useState<boolean>(false);

  // Automatically reset move mode when image is deselected
  React.useEffect(() => {
    if (!selected) {
      setMoveMode(false);
    }
  }, [selected]);

  // Mouse Drag Handler for Moving Position (Free Movement - Gated by Move Mode)
  const handleMoveMouseDown = (e: React.MouseEvent) => {
    if (!moveMode) return;
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startOffX = Number(offsetX) || 0;
    const startOffY = Number(offsetY) || 0;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      updateAttributes({
        offsetX: Math.round(startOffX + deltaX),
        offsetY: Math.round(startOffY + deltaY),
      });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Touch Event Drag Handler for Moving Position on Touch Devices
  const handleMoveTouchStart = (e: React.TouchEvent) => {
    if (!moveMode) return;
    e.stopPropagation();
    const touch = e.touches[0];
    if (!touch) return;

    const startX = touch.clientX;
    const startY = touch.clientY;
    const startOffX = Number(offsetX) || 0;
    const startOffY = Number(offsetY) || 0;

    const onTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      if (!moveTouch) return;
      const deltaX = moveTouch.clientX - startX;
      const deltaY = moveTouch.clientY - startY;
      updateAttributes({
        offsetX: Math.round(startOffX + deltaX),
        offsetY: Math.round(startOffY + deltaY),
      });
    };

    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  // Mouse Drag Handler for Resizing
  const handleResize = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startWidth = imgRef.current?.getBoundingClientRect().width || 300;
    const parentWidth = containerRef.current?.parentElement?.getBoundingClientRect().width || 700;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = corner.includes('right')
        ? moveEvent.clientX - startX
        : startX - moveEvent.clientX;
      const newPx = Math.max(60, Math.min(parentWidth, startWidth + deltaX));
      const newPercent = Math.round((newPx / parentWidth) * 100) + '%';
      updateAttributes({ width: newPercent });
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  // Touch Event Drag Handler for Resizing on Touchscreens / Mobile
  const handleTouchStart = (e: React.TouchEvent, corner: string) => {
    e.stopPropagation();

    const touch = e.touches[0];
    if (!touch) return;

    const startX = touch.clientX;
    const startWidth = imgRef.current?.getBoundingClientRect().width || 300;
    const parentWidth = containerRef.current?.parentElement?.getBoundingClientRect().width || 700;

    const onTouchMove = (moveEvent: TouchEvent) => {
      const moveTouch = moveEvent.touches[0];
      if (!moveTouch) return;
      const deltaX = corner.includes('right')
        ? moveTouch.clientX - startX
        : startX - moveTouch.clientX;
      const newPx = Math.max(60, Math.min(parentWidth, startWidth + deltaX));
      const newPercent = Math.round((newPx / parentWidth) * 100) + '%';
      updateAttributes({ width: newPercent });
    };

    const onTouchEnd = () => {
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };

    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);
  };

  const handlePresetWidth = (pct: string) => {
    updateAttributes({ width: pct });
  };

  const handleAlignment = (align: 'left' | 'center' | 'right') => {
    updateAttributes({ alignment: align });
  };

  const handleTextWrap = (wrap: WrapMode) => {
    updateAttributes({ textWrap: wrap });
  };

  const handleResetPosition = () => {
    updateAttributes({ offsetX: 0, offsetY: 0 });
    setMoveMode(false);
  };

  // Determine wrapper layout & text wrap styling
  const getWrapperStyle = (): React.CSSProperties => {
    const tx = Number(offsetX) || 0;
    const ty = Number(offsetY) || 0;
    const transformStyle = (tx || ty) ? `translate3d(${tx}px, ${ty}px, 0px)` : 'none';

    const base: React.CSSProperties = {
      position: 'relative',
      userSelect: 'none',
      touchAction: 'manipulation',
      transform: transformStyle,
    };

    if (textWrap === 'behind') {
      return {
        ...base,
        position: 'absolute',
        left: alignment === 'left' ? '0' : alignment === 'right' ? 'auto' : '50%',
        right: alignment === 'right' ? '0' : 'auto',
        transform: alignment === 'center' ? `translateX(-50%) ${transformStyle}` : transformStyle,
        zIndex: 0,
        opacity: 0.65,
        margin: 0,
        display: 'inline-block',
        pointerEvents: 'auto',
      };
    }
    if (textWrap === 'front') {
      return {
        ...base,
        position: 'absolute',
        left: alignment === 'left' ? '0' : alignment === 'right' ? 'auto' : '50%',
        right: alignment === 'right' ? '0' : 'auto',
        transform: alignment === 'center' ? `translateX(-50%) ${transformStyle}` : transformStyle,
        zIndex: 25,
        margin: 0,
        display: 'inline-block',
        pointerEvents: 'auto',
      };
    }
    if (textWrap === 'left') {
      return {
        ...base,
        float: 'left',
        margin: '4px 16px 12px 0',
        display: 'inline-block',
        zIndex: 2,
      };
    }
    if (textWrap === 'right') {
      return {
        ...base,
        float: 'right',
        margin: '4px 0 12px 16px',
        display: 'inline-block',
        zIndex: 2,
      };
    }
    if (textWrap === 'tight') {
      return {
        ...base,
        float: 'left',
        margin: '2px 10px 4px 0',
        display: 'inline-block',
        zIndex: 2,
      };
    }
    if (textWrap === 'break') {
      return {
        ...base,
        display: 'flex',
        justifyContent: getJustifyContent(),
        clear: 'both',
        margin: '16px 0',
        zIndex: 2,
      };
    }

    // Default 'inline'
    return {
      ...base,
      display: 'inline-flex',
      justifyContent: getJustifyContent(),
      margin: '6px 8px',
      verticalAlign: 'middle',
      zIndex: 2,
    };
  };

  const getJustifyContent = () => {
    if (alignment === 'left') return 'flex-start';
    if (alignment === 'right') return 'flex-end';
    return 'center';
  };

  const hasOffset = !!offsetX || !!offsetY;

  return (
    <NodeViewWrapper ref={containerRef} style={getWrapperStyle()}>
      <div
        onMouseDown={handleMoveMouseDown}
        onTouchStart={handleMoveTouchStart}
        style={{
          position: 'relative',
          display: 'inline-block',
          width: width,
          maxWidth: '100%',
          outline: moveMode
            ? '2px dashed #4f46e5'
            : (selected ? '2px solid var(--primary)' : 'none'),
          outlineOffset: '2px',
          borderRadius: 4,
          transition: 'outline 0.15s ease',
          cursor: moveMode ? 'move' : 'pointer',
        }}
        title={moveMode ? 'Drag & Move Mode Active - Click & Drag to Move' : 'Click image to open tools'}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            border: 'none',
            outline: 'none',
            background: 'transparent',
            boxShadow: 'none',
            pointerEvents: 'auto',
            mixBlendMode: textWrap === 'behind' ? 'multiply' : 'normal',
          }}
        />

        {/* Floating Move Status Badge when Move Mode is ON */}
        {selected && moveMode && (
          <div
            style={{
              position: 'absolute',
              top: -24,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#4f46e5',
              color: '#ffffff',
              fontSize: 10,
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10,
            }}
          >
            ✥ Drag & Move Enabled ({offsetX || 0}px, {offsetY || 0}px)
          </div>
        )}

        {/* Word-Style Floating Image & Text Wrap Toolbar */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              top: -56,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 100,
              background: '#1e293b',
              color: '#ffffff',
              padding: '6px 10px',
              borderRadius: 8,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 11,
              whiteSpace: 'nowrap',
              animation: 'modalPop 0.15s ease-out',
              touchAction: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setMoveMode((prev) => !prev)}
              style={{
                background: moveMode ? '#4f46e5' : '#334155',
                color: 'white',
                border: moveMode ? '1px solid #818cf8' : 'none',
                padding: '3px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
                boxShadow: moveMode ? '0 0 8px rgba(99, 102, 241, 0.5)' : 'none',
              }}
              title="Click to enable or disable Drag & Move mode"
            >
              {moveMode ? '✥ Drag & Move (ON)' : '✥ Drag & Move'}
            </button>

            {hasOffset && (
              <button
                type="button"
                onClick={handleResetPosition}
                style={{
                  background: '#64748b',
                  color: 'white',
                  border: 'none',
                  padding: '3px 6px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                }}
                title="Reset position offset to 0"
              >
                ↺ Reset
              </button>
            )}

            <div style={{ width: 1, height: 16, background: '#475569', margin: '0 2px' }} />

            <span style={{ fontWeight: 700, color: '#94a3b8', marginRight: 1 }}>SIZE:</span>
            {['25%', '50%', '75%', '100%'].map((pct) => (
              <button
                key={pct}
                type="button"
                onClick={() => handlePresetWidth(pct)}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  handlePresetWidth(pct);
                }}
                style={{
                  background: width === pct ? 'var(--primary)' : '#334155',
                  color: 'white',
                  border: 'none',
                  padding: '3px 6px',
                  borderRadius: 4,
                  cursor: 'pointer',
                  fontSize: 11,
                  fontWeight: width === pct ? 700 : 500,
                  touchAction: 'manipulation',
                }}
              >
                {pct}
              </button>
            ))}

            <div style={{ width: 1, height: 16, background: '#475569', margin: '0 2px' }} />

            <span style={{ fontWeight: 700, color: '#94a3b8', marginRight: 1 }}>WRAP:</span>
            <button
              type="button"
              onClick={() => handleTextWrap('inline')}
              style={{
                background: textWrap === 'inline' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
              title="In Line with Text"
            >
              Inline
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('left')}
              style={{
                background: textWrap === 'left' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
              title="Square Left (Text wraps around)"
            >
              Square L
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('right')}
              style={{
                background: textWrap === 'right' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
              title="Square Right (Text wraps around)"
            >
              Square R
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('break')}
              style={{
                background: textWrap === 'break' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
              title="Top and Bottom (Break line)"
            >
              Top/Bot
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('behind')}
              style={{
                background: textWrap === 'behind' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
              title="Behind Text (Watermark mode)"
            >
              Behind
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('front')}
              style={{
                background: textWrap === 'front' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
              title="In Front of Text (Floating stamp / seal mode)"
            >
              Front
            </button>

            <div style={{ width: 1, height: 16, background: '#475569', margin: '0 2px' }} />

            <span style={{ fontWeight: 700, color: '#94a3b8', marginRight: 1 }}>ALIGN:</span>
            <button
              type="button"
              onClick={() => handleAlignment('left')}
              style={{
                background: alignment === 'left' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Left
            </button>
            <button
              type="button"
              onClick={() => handleAlignment('center')}
              style={{
                background: alignment === 'center' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Center
            </button>
            <button
              type="button"
              onClick={() => handleAlignment('right')}
              style={{
                background: alignment === 'right' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
              }}
            >
              Right
            </button>

            <div style={{ width: 1, height: 16, background: '#475569', margin: '0 2px' }} />

            <button
              type="button"
              onClick={deleteNode}
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '3px 8px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 700,
              }}
              title="Delete Image / Seal"
            >
              🗑️ Delete
            </button>
          </div>
        )}

        {/* 4-Corner Resizing Handles */}
        {selected && (
          <>
            <div
              onMouseDown={(e) => handleResize(e, 'top-left')}
              onTouchStart={(e) => handleTouchStart(e, 'top-left')}
              style={{
                position: 'absolute',
                top: -5,
                left: -5,
                width: 10,
                height: 10,
                background: 'var(--primary)',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                zIndex: 101,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                touchAction: 'none',
              }}
            />
            <div
              onMouseDown={(e) => handleResize(e, 'top-right')}
              onTouchStart={(e) => handleTouchStart(e, 'top-right')}
              style={{
                position: 'absolute',
                top: -5,
                right: -5,
                width: 10,
                height: 10,
                background: 'var(--primary)',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'nesw-resize',
                zIndex: 101,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                touchAction: 'none',
              }}
            />
            <div
              onMouseDown={(e) => handleResize(e, 'bottom-left')}
              onTouchStart={(e) => handleTouchStart(e, 'bottom-left')}
              style={{
                position: 'absolute',
                bottom: -5,
                left: -5,
                width: 10,
                height: 10,
                background: 'var(--primary)',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'nesw-resize',
                zIndex: 101,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                touchAction: 'none',
              }}
            />
            <div
              onMouseDown={(e) => handleResize(e, 'bottom-right')}
              onTouchStart={(e) => handleTouchStart(e, 'bottom-right')}
              style={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                width: 10,
                height: 10,
                background: 'var(--primary)',
                border: '1px solid white',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                zIndex: 101,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                touchAction: 'none',
              }}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export const ResizableImage = Node.create({
  name: 'image',
  group: 'inline',
  inline: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: (element) => element.getAttribute('src') || element.querySelector('img')?.getAttribute('src') || null,
      },
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute('alt') || element.querySelector('img')?.getAttribute('alt') || null,
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute('title') || element.querySelector('img')?.getAttribute('title') || null,
      },
      width: {
        default: '100%',
        parseHTML: (element) => {
          const img = element.tagName.toLowerCase() === 'img' ? element : element.querySelector('img');
          const target = img || element;
          return target.getAttribute('width') || target.style.width || element.getAttribute('width') || element.style.width || '100%';
        },
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
          };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (element) => {
          const img = element.tagName.toLowerCase() === 'img' ? element : element.querySelector('img');
          const dataAlign = element.getAttribute('data-alignment') || img?.getAttribute('data-alignment');
          if (dataAlign) return dataAlign;
          const textAlign = element.style.textAlign || (img as HTMLElement)?.style?.textAlign;
          if (textAlign && (textAlign === 'left' || textAlign === 'right' || textAlign === 'center')) return textAlign;
          const parentAlign = (element as HTMLElement).parentElement?.style?.textAlign;
          if (parentAlign && (parentAlign === 'left' || parentAlign === 'right' || parentAlign === 'center')) return parentAlign;
          return 'center';
        },
        renderHTML: (attributes) => {
          return {
            'data-alignment': attributes.alignment || 'center',
          };
        },
      },
      textWrap: {
        default: 'inline',
        parseHTML: (element) => {
          const img = element.tagName.toLowerCase() === 'img' ? element : element.querySelector('img');
          const wrapAttr = element.getAttribute('data-text-wrap') || img?.getAttribute('data-text-wrap');
          if (wrapAttr) return wrapAttr;
          const target = img || element;
          const floatVal = target.style.float || target.getAttribute('align') || element.style.float;
          if (floatVal === 'left') return 'left';
          if (floatVal === 'right') return 'right';
          if (target.style.clear === 'both' || element.style.clear === 'both') return 'break';
          if (target.style.position === 'absolute' && target.style.zIndex === '0') return 'behind';
          if (target.style.position === 'absolute' && target.style.zIndex === '25') return 'front';
          return 'inline';
        },
        renderHTML: (attributes) => {
          return {
            'data-text-wrap': attributes.textWrap || 'inline',
          };
        },
      },
      offsetX: {
        default: 0,
        parseHTML: (element) => {
          const img = element.tagName.toLowerCase() === 'img' ? element : element.querySelector('img');
          return parseInt(element.getAttribute('data-offset-x') || img?.getAttribute('data-offset-x') || element.style.left || '0', 10) || 0;
        },
        renderHTML: (attributes) => ({
          'data-offset-x': attributes.offsetX || 0,
        }),
      },
      offsetY: {
        default: 0,
        parseHTML: (element) => {
          const img = element.tagName.toLowerCase() === 'img' ? element : element.querySelector('img');
          return parseInt(element.getAttribute('data-offset-y') || img?.getAttribute('data-offset-y') || element.style.top || '0', 10) || 0;
        },
        renderHTML: (attributes) => ({
          'data-offset-y': attributes.offsetY || 0,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span.image-node-wrap',
        getAttrs: (element) => {
          const dom = element as HTMLElement;
          if (!dom.querySelector('img') && !dom.getAttribute('data-text-wrap')) {
            return false;
          }
          return null;
        },
      },
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes['data-alignment'] || 'center';
    const wrap = HTMLAttributes['data-text-wrap'] || 'inline';
    const offX = Number(HTMLAttributes['data-offset-x']) || 0;
    const offY = Number(HTMLAttributes['data-offset-y']) || 0;
    const width = HTMLAttributes.width || '100%';
    const transformCss = (offX || offY) ? `transform: translate3d(${offX}px, ${offY}px, 0px);` : '';

    let floatStyle = 'none';
    let marginStyle = 'margin: 4px 8px; display: inline-block;';
    let clearStyle = 'none';
    let zIndexStyle = '2';
    let positionStyle = 'relative';

    if (wrap === 'left') {
      floatStyle = 'left';
      marginStyle = 'margin: 4px 16px 12px 0; display: inline-block;';
    } else if (wrap === 'right') {
      floatStyle = 'right';
      marginStyle = 'margin: 4px 0 12px 16px; display: inline-block;';
    } else if (wrap === 'tight') {
      floatStyle = 'left';
      marginStyle = 'margin: 2px 10px 4px 0; display: inline-block;';
    } else if (wrap === 'break') {
      floatStyle = 'none';
      clearStyle = 'both';
      marginStyle = 'margin: 14px auto; display: block; clear: both;';
    } else if (wrap === 'behind') {
      floatStyle = 'none';
      positionStyle = 'absolute';
      marginStyle = 'margin: 0; display: inline-block; opacity: 0.65; position: absolute; z-index: 0; pointer-events: auto; mix-blend-mode: multiply;';
      zIndexStyle = '0';
    } else if (wrap === 'front') {
      floatStyle = 'none';
      positionStyle = 'absolute';
      marginStyle = 'margin: 0; display: inline-block; position: absolute; z-index: 25; pointer-events: auto;';
      zIndexStyle = '25';
    }

    return [
      'span',
      {
        class: `image-node-wrap wrap-${wrap}`,
        style: `display: ${wrap === 'break' ? 'block' : 'inline-block'}; text-align: ${align}; position: ${positionStyle}; z-index: ${zIndexStyle}; ${transformCss}`,
        'data-alignment': align,
        'data-text-wrap': wrap,
        'data-offset-x': offX,
        'data-offset-y': offY,
      },
      [
        'img',
        mergeAttributes(HTMLAttributes, {
          align: wrap === 'left' || wrap === 'tight' ? 'left' : wrap === 'right' ? 'right' : align,
          'data-alignment': align,
          'data-text-wrap': wrap,
          'data-offset-x': offX,
          'data-offset-y': offY,
          style: `width: ${width}; max-width: 100%; height: auto; float: ${floatStyle}; clear: ${clearStyle}; z-index: ${zIndexStyle}; position: ${positionStyle}; ${marginStyle} ${transformCss}`,
        }),
      ],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ResizableImageComponent);
  },

  addCommands(): any {
    return {
      setImage:
        (options: { src: string; alt?: string; title?: string; width?: string; alignment?: string; textWrap?: string }) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },
});
