import {defs, tiny} from './examples/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Matrix, Mat4, Light, Shape, Material, Scene,
} = tiny;

export class Project extends Scene {
    /**
     * This Scene object can be added to any display canvas.
     * We isolate that code so it can be experimented with on its own.
     * This gives you a very small code sandbox for editing a simple scene, and for
     * experimenting with matrix transformations.
     */

    constructor() {
        // constructor(): Scenes begin by populating initial values like the Shapes and Materials they'll need.
        super();

        // At the beginning of our program, load one of each of these shape definitions onto the GPU.
        this.shapes = {
            cube: new defs.Cube(),
            sphere: new defs.Subdivision_Sphere(4),
        };

        // *** Materials
        this.materials = {
            plastic: new Material(new defs.Phong_Shader(),
                {ambient: .4, diffusivity: .6, color: hex_color("#ffffff")}),
        };

        // Variables global to the scene
        // TODO: Tweak the size of sphere and it's location as necessary
        this.avatar_point = vec3(0, 1.5, 0)
        this.avatar_transform = Mat4.translation(this.avatar_point[0], this.avatar_point[1], this.avatar_point[2])
            .times(Mat4.scale(0.5, 0.5, 0.5));

        this.MOVE_RATE = 0.2;
    }
    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        this.key_triggered_button("left", ["h"], () => {
            this.avatar_transform = Mat4.translation(-this.MOVE_RATE, 0, 0).times(this.avatar_transform);
            this.avatar_point[0] -= this.MOVE_RATE;
        });

        this.key_triggered_button("right", ["k"], () => {
            this.avatar_transform = Mat4.translation(this.MOVE_RATE, 0, 0).times(this.avatar_transform);
            this.avatar_point[0] += this.MOVE_RATE;
        });

        this.key_triggered_button("forward", ["u"], () => {
            this.avatar_transform = Mat4.translation(0, 0, -this.MOVE_RATE).times(this.avatar_transform);
            this.avatar_point[2] -= this.MOVE_RATE;
        });

        this.key_triggered_button("back", ["j"], () => {
            this.avatar_transform = Mat4.translation(0, 0, this.MOVE_RATE).times(this.avatar_transform);
            this.avatar_point[2] += this.MOVE_RATE;
        });
    }
    display(context, program_state) {
        // display():  Called once per frame of animation. Here, the base class's display only does
        // some initial setup.

        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:
        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];


        const gray = hex_color("#808080");
        let model_transform = Mat4.identity();

        // TODO: Tweak eye point as necessary to make the game look good
        let eye_point = (this.avatar_point).plus(vec3(0, 3.6, 6));
        let camera_matrix = Mat4.look_at(eye_point, this.avatar_point, vec3(0, 1, 0));
        program_state.set_camera(camera_matrix);

        // TODO: DRAW MAZE
        this.shapes.cube.draw(context, program_state, Mat4.identity(), this.materials.plastic.override({color: gray}));

        // DRAW SPHERE
        this.shapes.sphere.draw(context, program_state, this.avatar_transform, this.materials.plastic);
    }
}
