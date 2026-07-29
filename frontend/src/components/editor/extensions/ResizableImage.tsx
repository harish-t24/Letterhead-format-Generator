import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import React, { useRef } from 'react';

type WrapMode = 'inline' | 'left' | 'right' | 'tight' | 'break' | 'behind' | 'front';

function ResizableImageComponent(props: any) {
  const { node, updateAttributes, selected, deleteNode } = props;
  const { src, alt, width = '100%', alignment = 'center', textWrap = 'inline' } = node.attrs;
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Determine wrapper layout & text wrap styling
  const getWrapperStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'relative',
      userSelect: 'none',
      touchAction: 'manipulation',
    };

    if (textWrap === 'behind') {
      return {
        ...base,
        position: 'absolute',
        left: alignment === 'left' ? '0' : alignment === 'right' ? 'auto' : '50%',
        right: alignment === 'right' ? '0' : 'auto',
        transform: alignment === 'center' ? 'translateX(-50%)' : 'none',
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
        transform: alignment === 'center' ? 'translateX(-50%)' : 'none',
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

  return (
    <NodeViewWrapper ref={containerRef} style={getWrapperStyle()}>
      <div
        data-drag-handle
        style={{
          position: 'relative',
          display: 'inline-block',
          width: width,
          maxWidth: '100%',
          outline: selected ? '2px solid var(--primary)' : 'none',
          outlineOffset: '2px',
          borderRadius: 4,
          transition: 'outline 0.15s ease',
          cursor: 'grab',
        }}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt || ''}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            borderRadius: 4,
            boxShadow: 'var(--shadow-sm)',
            pointerEvents: 'auto',
            mixBlendMode: textWrap === 'behind' ? 'multiply' : 'normal',
          }}
        />

        {/* Word-Style Floating Image & Text Wrap Toolbar */}
        {selected && (
          <div
            style={{
              position: 'absolute',
              top: -46,
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
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTextWrap('inline');
              }}
              title="In Line With Text"
              style={{
                background: textWrap === 'inline' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                touchAction: 'manipulation',
              }}
            >
              📄 Inline
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('left')}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTextWrap('left');
              }}
              title="Wrap Text Left (Square Left)"
              style={{
                background: textWrap === 'left' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                touchAction: 'manipulation',
              }}
            >
              ◀ Left
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('right')}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTextWrap('right');
              }}
              title="Wrap Text Right (Square Right)"
              style={{
                background: textWrap === 'right' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                touchAction: 'manipulation',
              }}
            >
              ▶ Right
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('tight')}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTextWrap('tight');
              }}
              title="Tight Wrap"
              style={{
                background: textWrap === 'tight' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                touchAction: 'manipulation',
              }}
            >
              📐 Tight
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('break')}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTextWrap('break');
              }}
              title="Top and Bottom (Break Text)"
              style={{
                background: textWrap === 'break' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                touchAction: 'manipulation',
              }}
            >
              ⏬ Top/Bottom
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('behind')}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTextWrap('behind');
              }}
              title="Behind Text (Watermark Layer)"
              style={{
                background: textWrap === 'behind' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                touchAction: 'manipulation',
              }}
            >
              🔤 Behind Text
            </button>
            <button
              type="button"
              onClick={() => handleTextWrap('front')}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleTextWrap('front');
              }}
              title="In Front of Text"
              style={{
                background: textWrap === 'front' ? 'var(--primary)' : '#334155',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                touchAction: 'manipulation',
              }}
            >
              🔝 In Front
            </button>

            {(textWrap === 'inline' || textWrap === 'behind' || textWrap === 'front') && (
              <>
                <div style={{ width: 1, height: 16, background: '#475569', margin: '0 2px' }} />
                <span style={{ fontWeight: 700, color: '#94a3b8', marginRight: 1 }}>ALIGN:</span>
                <button
                  type="button"
                  onClick={() => handleAlignment('left')}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleAlignment('left');
                  }}
                  title="Align Left"
                  style={{
                    background: alignment === 'left' ? 'var(--primary)' : '#334155',
                    color: 'white',
                    border: 'none',
                    padding: '3px 6px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    touchAction: 'manipulation',
                  }}
                >
                  ⟸
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignment('center')}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleAlignment('center');
                  }}
                  title="Align Center"
                  style={{
                    background: alignment === 'center' ? 'var(--primary)' : '#334155',
                    color: 'white',
                    border: 'none',
                    padding: '3px 6px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    touchAction: 'manipulation',
                  }}
                >
                  ⟺
                </button>
                <button
                  type="button"
                  onClick={() => handleAlignment('right')}
                  onTouchEnd={(e) => {
                    e.preventDefault();
                    handleAlignment('right');
                  }}
                  title="Align Right"
                  style={{
                    background: alignment === 'right' ? 'var(--primary)' : '#334155',
                    color: 'white',
                    border: 'none',
                    padding: '3px 6px',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: 11,
                    touchAction: 'manipulation',
                  }}
                >
                  ⟹
                </button>
              </>
            )}

            <div style={{ width: 1, height: 16, background: '#475569', margin: '0 2px' }} />

            <button
              type="button"
              onClick={deleteNode}
              onTouchEnd={(e) => {
                e.preventDefault();
                deleteNode();
              }}
              title="Delete Image"
              style={{
                background: '#ef4444',
                color: 'white',
                border: 'none',
                padding: '3px 6px',
                borderRadius: 4,
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                touchAction: 'manipulation',
              }}
            >
              🗑️ Delete
            </button>
          </div>
        )}

        {/* Drag Resize Handles on Selection (Mouse & Touch Enabled) */}
        {selected && (
          <>
            {/* Top-Left */}
            <div
              onMouseDown={(e) => handleResize(e, 'top-left')}
              onTouchStart={(e) => handleTouchStart(e, 'top-left')}
              style={{
                position: 'absolute',
                top: -6,
                left: -6,
                width: 14,
                height: 14,
                background: 'var(--primary)',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                touchAction: 'none',
              }}
            />
            {/* Top-Right */}
            <div
              onMouseDown={(e) => handleResize(e, 'top-right')}
              onTouchStart={(e) => handleTouchStart(e, 'top-right')}
              style={{
                position: 'absolute',
                top: -6,
                right: -6,
                width: 14,
                height: 14,
                background: 'var(--primary)',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'nesw-resize',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                touchAction: 'none',
              }}
            />
            {/* Bottom-Left */}
            <div
              onMouseDown={(e) => handleResize(e, 'bottom-left')}
              onTouchStart={(e) => handleTouchStart(e, 'bottom-left')}
              style={{
                position: 'absolute',
                bottom: -6,
                left: -6,
                width: 14,
                height: 14,
                background: 'var(--primary)',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'nesw-resize',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
                touchAction: 'none',
              }}
            />
            {/* Bottom-Right */}
            <div
              onMouseDown={(e) => handleResize(e, 'bottom-right')}
              onTouchStart={(e) => handleTouchStart(e, 'bottom-right')}
              style={{
                position: 'absolute',
                bottom: -6,
                right: -6,
                width: 14,
                height: 14,
                background: 'var(--primary)',
                border: '2px solid white',
                borderRadius: '50%',
                cursor: 'nwse-resize',
                zIndex: 10,
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
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: '100%',
        parseHTML: (element) => element.getAttribute('width') || element.style.width || '100%',
        renderHTML: (attributes) => {
          if (!attributes.width) return {};
          return {
            width: attributes.width,
          };
        },
      },
      alignment: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-alignment') || element.style.textAlign || 'center',
        renderHTML: (attributes) => {
          return {
            'data-alignment': attributes.alignment || 'center',
          };
        },
      },
      textWrap: {
        default: 'inline',
        parseHTML: (element) => {
          const wrapAttr = element.getAttribute('data-text-wrap');
          if (wrapAttr) return wrapAttr;
          const floatVal = element.style.float || element.getAttribute('align');
          if (floatVal === 'left') return 'left';
          if (floatVal === 'right') return 'right';
          if (element.style.clear === 'both') return 'break';
          if (element.style.position === 'absolute' && element.style.zIndex === '0') return 'behind';
          if (element.style.position === 'absolute' && element.style.zIndex === '25') return 'front';
          return 'inline';
        },
        renderHTML: (attributes) => {
          return {
            'data-text-wrap': attributes.textWrap || 'inline',
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
      {
        tag: 'span[data-text-wrap]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes['data-alignment'] || 'center';
    const wrap = HTMLAttributes['data-text-wrap'] || 'inline';

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
        style: `display: ${wrap === 'break' ? 'block' : 'inline-block'}; text-align: ${align}; position: ${positionStyle}; z-index: ${zIndexStyle};`,
      },
      [
        'img',
        mergeAttributes(HTMLAttributes, {
          align: wrap === 'left' || wrap === 'tight' ? 'left' : wrap === 'right' ? 'right' : undefined,
          style: `width: ${HTMLAttributes.width || '100%'}; max-width: 100%; height: auto; float: ${floatStyle}; clear: ${clearStyle}; z-index: ${zIndexStyle}; position: ${positionStyle}; ${marginStyle}`,
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
