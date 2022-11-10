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

        const data_members = {
            thrust: vec3(0, 0, 0), meters_per_frame: 7, speed_multiplier: 1,
        };
        Object.assign(this, data_members);

        // Variables global to the scene
        // TODO: Tweak the size of sphere and it's location as necessary
        this.avatar_point = vec4(0, 7, 0, 1);
        this.avatar_transform = Mat4.translation(this.avatar_point[0], this.avatar_point[1], this.avatar_point[2])
            .times(Mat4.scale(0.5, 0.5, 0.5));

        this.MOVE_RATE = 0.2;
    }
    make_control_panel() {
        // Draw the scene's buttons, setup their actions and keyboard shortcuts, and monitor live measurements.
        // this.key_triggered_button("left", ["h"], () => {
        //     this.avatar_transform = Mat4.translation(-this.MOVE_RATE, 0, 0).times(this.avatar_transform);
        //     this.avatar_point[0] -= this.MOVE_RATE;
        // });
        //
        // this.key_triggered_button("right", ["k"], () => {
        //     this.avatar_transform = Mat4.translation(this.MOVE_RATE, 0, 0).times(this.avatar_transform);
        //     this.avatar_point[0] += this.MOVE_RATE;
        // });
        //
        // this.key_triggered_button("forward", ["u"], () => {
        //     this.avatar_transform = Mat4.translation(0, 0, -this.MOVE_RATE).times(this.avatar_transform);
        //     this.avatar_point[2] -= this.MOVE_RATE;
        // });
        //
        // this.key_triggered_button("back", ["j"], () => {
        //     this.avatar_transform = Mat4.translation(0, 0, this.MOVE_RATE).times(this.avatar_transform);
        //     this.avatar_point[2] += this.MOVE_RATE;
        // });
        this.key_triggered_button("Forward", ["w"], () => this.thrust[2] = -1, undefined, () => this.thrust[2] = 0);
        this.key_triggered_button("Left", ["a"], () => this.thrust[0] = -1, undefined, () => this.thrust[0] = 0);
        this.key_triggered_button("Back", ["s"], () => this.thrust[2] = 1, undefined, () => this.thrust[2] = 0);
        this.key_triggered_button("Right", ["d"], () => this.thrust[0] = 1, undefined, () => this.thrust[0] = 0);
        //this.key_triggered_button("TEMP", ["x"], () => this.thrust[1] = -1, undefined, () => this.thrust[1] = 0);
    }
    display(context, program_state) {
        // display():  Called once per frame of animation.
        // Setup -- This part sets up the scene's overall camera matrix, projection matrix, and lights:

        // MOVE AVATAR AND CAMERA based on key input
        const dt = program_state.animation_delta_time / 1000;
        const m = this.speed_multiplier * this.meters_per_frame;
        this.avatar_transform.pre_multiply(Mat4.translation(...this.thrust.times(dt*m)));
        this.avatar_point = Mat4.translation(...this.thrust.times(dt*m)).times(this.avatar_point);

        // TODO: Apply gravity on the ball
        let gravity;
        if(this.avatar_point[1] <= 1.5) {
            this.thrust[1] = 0;
            this.avatar_point[1] = 1.5;
            gravity = 0;
        }
        else {
            gravity = 0.02;
        }
        this.thrust[1] -= gravity;

        // TODO: Tweak eye point as necessary to make the game look good
        let eye_point = (this.avatar_point.to3()).plus(vec3(0, 3.6, 6));
        let camera_matrix = Mat4.look_at(eye_point, this.avatar_point.to3(), vec3(0, 1, 0));
        program_state.set_camera(camera_matrix);

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        // *** Lights: *** Values of vector or point lights.
        const light_position = vec4(0, 5, 5, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];


        // DRAW OBJECTS
        const gray = hex_color("#808080");
        const darkgray =hex_color("#555555")
        const red = hex_color("#FF0000");
        let model_transform = Mat4.identity();

        // TODO: DRAW MAZE
      //  this.shapes.cube.draw(context, program_state, Mat4.identity(), this.materials.plastic.override({color: gray}));

          this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(0, 0.5, 2)), this.materials.plastic.override({color:red}));

       this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(0, 0, 0)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(0, 0, -2)), this.materials.plastic.override({color:gray}));
                 this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(2, 0, -2)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(4, 0, -2)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(4, 0, -4)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(4, 0, -6)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(2, 0, -6)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(0, 0, -6)), this.materials.plastic.override({color:gray}));
           this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-2 ,0, -6)), this.materials.plastic.override({color:gray}));

         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-4, 0, -6)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-4, 0, -4)), this.materials.plastic.override({color:gray}));


          this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-4, 0, -2)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-6, 0, -2)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, -2)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, -4)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, -6)), this.materials.plastic.override({color:gray}));

          this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, -8)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, -10)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-6, 0, -10)), this.materials.plastic.override({color:gray}));


        this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-4, 0, -10)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-4, 0, -12)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-2, 0, -12)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(0, 0, -12)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(2, 0, -12)), this.materials.plastic.override({color:gray}));
        this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(2, 0, -14)), this.materials.plastic.override({color:gray}));

         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(2, 0, -16)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(4, 0, -16)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(4, 0, -18)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(4, 0, -20)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(2, 0, -20)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(0, 0, -20)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(0, 0, -22)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-2, 0, -22)), this.materials.plastic.override({color:gray}));

        
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-4, 0, -22)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-4, 0, -20)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-4, 0, -18)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-6, 0, -18)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, -18)), this.materials.plastic.override({color:gray}));

         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, -20)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, -22)), this.materials.plastic.override({color:gray}));
         this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0, -24)), this.materials.plastic.override({color:gray}));
        
        this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-8, 0.5, -26)), this.materials.plastic.override({color:red}));

        for(let i = 0;i >= -28 ; i=i-2 ){
            
            for(let l= 0 ; l <14 ; l= l +2 )
                {
                     this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(-12, l, i)), this.materials.plastic.override({color:darkgray}));
                     this.shapes.cube.draw(context, program_state, model_transform.times(Mat4.translation(8, l, i)), this.materials.plastic.override({color:darkgray}));

                }
             
             
        }

        
        

        
        


        // DRAW SPHERE
        this.shapes.sphere.draw(context, program_state, this.avatar_transform, this.materials.plastic);
    }
}
