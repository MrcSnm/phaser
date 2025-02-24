/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @author       Felipe Alfonso <@bitnenfer>
 * @copyright    2019 Photon Storm Ltd.
 * @license      {@link https://opensource.org/licenses/MIT|MIT License}
 */

/**
 * Renders this Game Object with the WebGL Renderer to the given Camera.
 * The object will not render if any of its renderFlags are set or it is being actively filtered out by the Camera.
 * This method should not be called directly. It is a utility function of the Render module.
 *
 * @method Phaser.GameObjects.Container#renderWebGL
 * @since 3.4.0
 * @private
 *
 * @param {Phaser.Renderer.WebGL.WebGLRenderer} renderer - A reference to the current active WebGL renderer.
 * @param {Phaser.GameObjects.Container} container - The Game Object being rendered in this call.
 * @param {number} interpolationPercentage - Reserved for future use and custom pipelines.
 * @param {Phaser.Cameras.Scene2D.Camera} camera - The Camera that is rendering the Game Object.
 * @param {Phaser.GameObjects.Components.TransformMatrix} parentMatrix - This transform matrix is defined if the game object is nested
 */
var ContainerWebGLRenderer = function (renderer, container, interpolationPercentage, camera, parentMatrix)
{
    var children = container.list;

    if (children.length === 0)
    {
        return;
    }

    var transformMatrix = container.localTransform;
    
    if (parentMatrix)
    {
        transformMatrix.loadIdentity();
        transformMatrix.multiply(parentMatrix);
        transformMatrix.translate(container.x, container.y);
        transformMatrix.rotate(container.rotation);
        transformMatrix.scale(container.scaleX, container.scaleY);
    }
    else
    {
        transformMatrix.applyITRS(container.x, container.y, container.rotation, container.scaleX, container.scaleY);
    }

    var containerHasBlendMode = (container.blendMode !== -1);

    if (!containerHasBlendMode)
    {
        //  If Container is SKIP_TEST then set blend mode to be Normal
        renderer.setBlendMode(0);
    }

    var alpha = container._alpha;

    var alphaTopRight = container.alphaTopRight;
    var alphaBottomLeft = container.alphaBottomLeft;
    var alphaBottomRight = container.alphaBottomRight;
    var usingQuadAlpha = (alphaBottomLeft !== alpha || alphaBottomRight !== alpha || alphaTopRight !== alpha);

    var scrollFactorX = container.scrollFactorX;
    var scrollFactorY = container.scrollFactorY;

    for (var i = 0; i < children.length; i++)
    {
        var child = children[i];

        if (!child.willRender(camera))
        {
            continue;
        }

        var childAlpha = child.alpha;
        var childAlphaTopRight = child.alphaTopRight;
        var childAlphaBottomLeft = child.alphaBottomLeft;
        var childAlphaBottomRight = child.alphaBottomRight;
        var usingChildQuadAlpha = (childAlphaBottomLeft !== childAlpha || childAlphaBottomRight !== childAlpha || childAlphaTopRight !== childAlpha);

        var childScrollFactorX = child.scrollFactorX;
        var childScrollFactorY = child.scrollFactorY;

        if (!containerHasBlendMode && child.blendMode !== renderer.currentBlendMode)
        {
            //  If Container doesn't have its own blend mode, then a child can have one
            renderer.setBlendMode(child.blendMode);
        }

        if (child.mask)
        {
            child.mask.preRenderWebGL(renderer, child, camera);
        }

        //  Set parent values
        child.setScrollFactor(childScrollFactorX * scrollFactorX, childScrollFactorY * scrollFactorY);

        if (usingQuadAlpha)
        {
            if (usingChildQuadAlpha)
            {
                child.setAlpha(childAlpha * alpha, childAlphaTopRight * alphaTopRight, childAlphaBottomLeft * alphaBottomLeft, childAlphaBottomRight * alphaBottomRight);
            }
            else
            {
                child.setAlpha(childAlpha * alpha, childAlpha * alphaTopRight, childAlpha * alphaBottomLeft, childAlpha * alphaBottomRight);
            }
        }
        else if (usingChildQuadAlpha)
        {
            child.setAlpha(childAlpha * alpha, childAlphaTopRight * alpha, childAlphaBottomLeft * alpha, childAlphaBottomRight * alpha);
        }
        else
        {
            child.setAlpha(childAlpha * alpha);
        }

        //  Render
        child.renderWebGL(renderer, child, interpolationPercentage, camera, transformMatrix);

        //  Restore original values
        if (usingChildQuadAlpha)
        {
            child.setAlpha(childAlpha, childAlphaTopRight, childAlphaBottomLeft, childAlphaBottomRight);
        }
        else
        {
            child.setAlpha(childAlpha);
        }
        child.setScrollFactor(childScrollFactorX, childScrollFactorY);

        if (child.mask)
        {
            child.mask.postRenderWebGL(renderer, camera);
        }
    }
};

module.exports = ContainerWebGLRenderer;
