import * as B from "babylonjs";

export default {
    solve(q: number[], ds: number, 
        rhs: (q: number[], deltaQ: number[],
                ds: number, qScale: number) => number[]): number[] {
        let r: number[] = [];

        let dq1 = rhs(q, q, ds, 0.0);
        let dq2 = rhs(q, dq1, ds, 0.5);
        let dq3 = rhs(q, dq2, ds, 0.5);
        let dq4 = rhs(q, dq3, ds, 1.0);

        for (let i = 0; i < q.length; i++) {
            r.push(q[i] + (dq1[i] + 2.0 * dq2[i] + 2.0 * dq3[i] + dq4[i]) / 6.0);
        }

        return r;
    },

    solveForMotion(s: B.Vector3, v: B.Vector3, dt: number, 
        a: (s: B.Vector3, v: B.Vector3, dt: number) => B.Vector3) {
        // Returns final (position, velocity) array after time dt has passed.
        //        x: initial position
        //        v: initial velocity
        //        a: acceleration function a(x,v,dt) (must be callable)
        //        dt: timestep
        let s1 = s;
        let v1 = v;
        let a1 = a(s1, v1, 0);

        let s2 = s.add(v1.multiplyByFloats(0.5 * dt, 0.5 * dt, 0.5 * dt));
        let v2 = v.add(a1.multiplyByFloats(0.5 * dt, 0.5 * dt, 0.5 * dt));
        let a2 = a(s2, v2, 0.5 * dt);
    
        let s3 = s.add(v2.multiplyByFloats(0.5 * dt, 0.5 * dt, 0.5 * dt));
        let v3 = v.add(a2.multiplyByFloats(0.5 * dt, 0.5 * dt, 0.5 * dt));
        let a3 = a(s3, v3, 0.5 * dt);
    
        let s4 = s.add(v3.multiplyByFloats(dt, dt, dt));
        let v4 = v.add(a3.multiplyByFloats(dt, dt, dt));
        let a4 = a(s4, v4, dt);
    
        let dtp6 = dt / 6;

        let sf = s.add(
            v1.add(v2.multiplyByFloats(2, 2, 2))
                .add(v3.multiplyByFloats(2, 2, 2))
                .add(v4)
                .multiplyByFloats(dtp6, dtp6, dtp6)
        );
        //s + (dt / 6) * (v1 + 2 * v2 + 2 * v3 + v4);

        let vf = v.add(
            a1.add(a2.multiplyByFloats(2, 2, 2))
                .add(a3.multiplyByFloats(2, 2, 2))
                .add(a4)
                .multiplyByFloats(dtp6, dtp6, dtp6)
        );
        //v + (dt / 6) * (a1 + 2 * a2 + 2 * a3 + a4);
    
        return [sf, vf];
    }
}