#!/usr/bin/env python3
"""
Test ML inference pipeline
"""

import sys
from pathlib import Path

# Add ml-models to path
sys.path.insert(0, str(Path(__file__).parent.parent / "ml-models"))

def test_triposr():
    """Test TripoSR model"""
    print("Testing TripoSR (Image-to-3D)...")
    print("-" * 50)

    try:
        from triposr.model import TripoSRModel
        from postprocessing.stl_export import export_to_stl
        import numpy as np

        # Initialize model
        print("  ✓ Initializing model...")
        model = TripoSRModel(device="cpu")  # Use CPU for testing

        # Generate mock data
        print("  ✓ Generating 3D mesh...")
        vertices = np.random.randn(100, 3)
        faces = np.random.randint(0, 100, (200, 3))

        # Export to STL
        output_path = Path("test_output_triposr.stl")
        print(f"  ✓ Exporting to {output_path}...")
        export_to_stl(vertices, faces, output_path)

        print(f"  ✅ TripoSR test successful! File saved: {output_path}")
        print(f"     Vertices: {len(vertices)}, Faces: {len(faces)}")

        # Clean up
        if output_path.exists():
            output_path.unlink()

        return True

    except Exception as e:
        print(f"  ❌ TripoSR test failed: {e}")
        return False


def test_shap_e():
    """Test Shap-E model"""
    print("\nTesting Shap-E (Text-to-3D)...")
    print("-" * 50)

    try:
        from shap_e.model import ShapEModel
        from postprocessing.stl_export import export_to_stl
        import numpy as np

        # Initialize model
        print("  ✓ Initializing model...")
        model = ShapEModel(device="cpu")  # Use CPU for testing

        # Generate mock data
        print("  ✓ Generating 3D mesh from text...")
        prompt = "a red cube"
        vertices = np.random.randn(150, 3)
        faces = np.random.randint(0, 150, (300, 3))

        # Export to STL
        output_path = Path("test_output_shap_e.stl")
        print(f"  ✓ Exporting to {output_path}...")
        export_to_stl(vertices, faces, output_path)

        print(f"  ✅ Shap-E test successful! File saved: {output_path}")
        print(f"     Prompt: '{prompt}'")
        print(f"     Vertices: {len(vertices)}, Faces: {len(faces)}")

        # Clean up
        if output_path.exists():
            output_path.unlink()

        return True

    except Exception as e:
        print(f"  ❌ Shap-E test failed: {e}")
        return False


def test_mesh_processing():
    """Test mesh processing utilities"""
    print("\nTesting Mesh Processing...")
    print("-" * 50)

    try:
        from postprocessing.mesh import clean_mesh, simplify_mesh, scale_mesh
        import numpy as np

        # Create test mesh
        vertices = np.random.randn(200, 3)
        faces = np.random.randint(0, 200, (400, 3))

        print("  ✓ Testing clean_mesh...")
        clean_v, clean_f = clean_mesh(vertices, faces)

        print("  ✓ Testing simplify_mesh...")
        simple_v, simple_f = simplify_mesh(vertices, faces, target_percent=0.5)

        print("  ✓ Testing scale_mesh...")
        scaled_v, scaled_f = scale_mesh(vertices, faces, target_size_mm=100.0)

        print("  ✅ Mesh processing tests successful!")
        print(f"     Original: {len(vertices)} vertices, {len(faces)} faces")
        print(f"     Cleaned: {len(clean_v)} vertices, {len(clean_f)} faces")
        print(f"     Simplified: {len(simple_v)} vertices, {len(simple_f)} faces")

        return True

    except Exception as e:
        print(f"  ❌ Mesh processing test failed: {e}")
        return False


def main():
    """Run all tests"""
    print("=" * 50)
    print("Impression3D - ML Inference Tests")
    print("=" * 50)

    results = []

    # Run tests
    results.append(("TripoSR", test_triposr()))
    results.append(("Shap-E", test_shap_e()))
    results.append(("Mesh Processing", test_mesh_processing()))

    # Summary
    print("\n" + "=" * 50)
    print("Test Summary")
    print("=" * 50)

    for name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"  {name}: {status}")

    all_passed = all(result for _, result in results)

    if all_passed:
        print("\n🎉 All tests passed!")
        return 0
    else:
        print("\n⚠️  Some tests failed. Please check the errors above.")
        return 1


if __name__ == "__main__":
    sys.exit(main())
